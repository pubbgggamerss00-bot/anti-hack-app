package com.z.hack;

import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

/**
 * اپلیکیشن امنیتی «ضد هک» — نسخه آفلاین با قابلیت بررسی بروزرسانی از گیت‌هاب.
 * تمام محتوا (۲۰ درس آموزشی، ۱۳ ابزار امنیتی، میانبرها و چک‌لیست) به‌صورت
 * کاملاً محلی در assets برنامه قرار دارد و هیچ داده‌ای از دستگاه خارج نمی‌شود؛
 * تنها اتصال شبکه، دریافت آخرین نسخه منتشرشده از گیت‌هاب در بخش «بررسی بروزرسانی» است.
 */
public class MainActivity extends Activity {

    private static final String GH_LATEST =
            "https://api.github.com/repos/pubbgggamerss00-bot/anti-hack-app/releases/latest";

    private WebView webView;
    private Handler mainHandler;
    private MyketBilling myketBilling;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mainHandler = new Handler(Looper.getMainLooper());

        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(false);
        s.setLoadsImagesAutomatically(true);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);

        // پل ارتباطی جاوااسکریپت ↔ اندروید برای بررسی بروزرسانی و دانلود/نصب
        webView.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient());
        webView.setBackgroundColor(Color.rgb(5, 10, 24));
        webView.setVerticalScrollBarEnabled(false);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        // پس‌زمینه ناوبری همرنگ تم سرمه‌ای برنامه
        Window w = getWindow();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            w.setStatusBarColor(Color.rgb(5, 10, 24));
            w.setNavigationBarColor(Color.rgb(5, 10, 24));
            w.getDecorView().setSystemUiVisibility(0);
        }

        webView.loadUrl("file:///android_asset/index.html");
        setContentView(webView);

        /* راه‌اندازی کتابخانه رسمی خرید درون‌برنامه‌ای مایکت — پس از اتصال، مالکیت اشتراک پرو بررسی می‌شود */
        myketBilling = new MyketBilling(this, new MyketBilling.Listener() {
            @Override
            public void onBillingEvent(String json) {
                try {
                    JSONObject o = new JSONObject(json);
                    String type = o.optString("type", "");
                    if ("ownership".equals(type)) {
                        boolean owned = o.optBoolean("owned", false);
                        jsEval("window.__myketOwnership && window.__myketOwnership(" + (owned ? "true" : "false") + ")");
                    } else if ("purchase".equals(type)) {
                        boolean ok = o.optBoolean("ok", false);
                        jsEval("window.__myketPurchaseResult && window.__myketPurchaseResult(" + (ok ? "true" : "false") + "," + json + ")");
                    }
                } catch (Exception ignored) { }
            }
        });
        myketBilling.bind();
    }

    /* نتیجه خرید مایکت از طریق ProxyBillingActivity داخل کتابخانه رسمی دریافت می‌شود؛
       onActivityResult لازم نیست. */

    /* ───────────── نسخه نصب‌شده ───────────── */

    private String installedVersion() {
        try {
            PackageInfo pi = getPackageManager().getPackageInfo(getPackageName(), 0);
            return pi.versionName != null ? pi.versionName : "1.0.0";
        } catch (Exception e) {
            return "1.0.0";
        }
    }

    /* ───────────── مقایسه نسخه‌ها (مثل 1.2.0 با 1.10.0) ───────────── */

    private static int compareVersions(String a, String b) {
        String[] pa = a.replaceFirst("^[vV]", "").split("\\.");
        String[] pb = b.replaceFirst("^[vV]", "").split("\\.");
        int n = Math.max(pa.length, pb.length);
        for (int i = 0; i < n; i++) {
            int x = i < pa.length ? parseIntSafe(pa[i]) : 0;
            int y = i < pb.length ? parseIntSafe(pb[i]) : 0;
            if (x != y) return x > y ? 1 : -1;
        }
        return 0;
    }

    private static int parseIntSafe(String s) {
        try {
            String digits = s.trim().replaceAll("[^0-9]", "");
            return digits.length() == 0 ? 0 : Integer.parseInt(digits);
        } catch (Exception e) {
            return 0;
        }
    }

    /* ───────────── ابزار شبکه ───────────── */

    private static String httpGet(String urlStr) throws Exception {
        HttpURLConnection c = (HttpURLConnection) new URL(urlStr).openConnection();
        c.setConnectTimeout(15000);
        c.setReadTimeout(30000);
        c.setRequestProperty("User-Agent", "AntiHack-App");
        c.setRequestProperty("Accept", "application/vnd.github+json");
        int code = c.getResponseCode();
        InputStream in = code >= 200 && code < 300 ? c.getInputStream() : c.getErrorStream();
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        if (in != null) {
            BufferedInputStream bin = new BufferedInputStream(in);
            byte[] buf = new byte[8192];
            int n;
            while ((n = bin.read(buf)) != -1) bos.write(buf, 0, n);
            bin.close();
        }
        if (code < 200 || code >= 300) throw new Exception("HTTP " + code);
        return new String(bos.toByteArray(), StandardCharsets.UTF_8);
    }

    private void jsEval(final String script) {
        mainHandler.post(new Runnable() {
            @Override
            public void run() {
                if (webView != null) webView.evaluateJavascript(script, null);
            }
        });
    }

    /* ───────────── پل جاوااسکریپت ───────────── */

    private class AndroidBridge {

        /** نسخه نصب‌شده برنامه از PackageManager */
        @JavascriptInterface
        public String getAppVersion() {
            return installedVersion();
        }

        /**
         * بررسی آخرین نسخه منتشرشده در گیت‌هاب (API Releases) و مقایسه با نسخه نصب‌شده.
         * متدهای @JavascriptInterface روی ترد پس‌زمینه اجرا می‌شوند؛ فراخوانی شبکه مجاز است.
         */
        @JavascriptInterface
        public String checkUpdate() {
            JSONObject res = new JSONObject();
            try {
                String body = httpGet(GH_LATEST);
                JSONObject o = new JSONObject(body);
                String latest = o.optString("tag_name", "").replaceFirst("^[vV]", "");
                String current = installedVersion();
                if (latest.length() == 0) throw new Exception("empty tag_name");

                String apkUrl = "";
                JSONArray assets = o.optJSONArray("assets");
                if (assets != null) {
                    for (int i = 0; i < assets.length(); i++) {
                        JSONObject a = assets.optJSONObject(i);
                        if (a == null) continue;
                        if (a.optString("name", "").toLowerCase().endsWith(".apk")) {
                            apkUrl = a.optString("browser_download_url", "");
                            break;
                        }
                    }
                }

                res.put("ok", true);
                res.put("currentVersion", current);
                res.put("latestVersion", latest);
                res.put("title", o.optString("name", ""));
                res.put("changelog", o.optString("body", ""));
                res.put("downloadUrl", apkUrl);
                res.put("publishedAt", o.optString("published_at", ""));
                res.put("isNewer", compareVersions(latest, current) > 0);
            } catch (Exception e) {
                try {
                    res.put("ok", false);
                    String msg = e.getMessage() != null ? e.getMessage() : "";
                    if (msg.contains("403")) {
                        res.put("error", "تعداد درخواست‌های بررسی بیش از حد مجاز است؛ چند دقیقه بعد دوباره تلاش کنید.");
                    } else {
                        res.put("error", "خطا در اتصال به سرور بروزرسانی گیت‌هاب. اتصال اینترنت دستگاه را بررسی کنید.");
                    }
                } catch (Exception ignored) { }
            }
            return res.toString();
        }

        /** دانلود APK از گیت‌هاب (با گزارش پیشرفت) و سپس بازکردن صفحه نصب */
        @JavascriptInterface
        public void downloadAndInstall(final String url, final String version) {
            new Thread(new Runnable() {
                @Override
                public void run() {
                    downloadAndInstallImpl(url, version);
                }
            }).start();
        }

        /** بازکردن لینک خارجی (مثلاً صفحه دریافت مایکت) در مرورگر/اپ مقصد */
        @JavascriptInterface
        public void openExternal(String url) {
            try {
                Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(url));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
            } catch (Exception ignored) { }
        }

        /** بررسی مالکیت اشتراک پرو از مایکت (بازیابی خریدهای قبلی) — خروجی JSON */
        @JavascriptInterface
        public String myketCheckOwned() {
            if (myketBilling == null) return "{\"ok\":false,\"error\":\"unavailable\"}";
            return myketBilling.checkOwnershipJson();
        }

        /** شروع خرید درون‌برنامه‌ای «اشتراک پرو» (شناسه Pro) از مایکت — خروجی JSON */
        @JavascriptInterface
        public String myketBuy() {
            if (myketBilling == null) return "{\"ok\":false,\"error\":\"unavailable\"}";
            return myketBilling.buy(MainActivity.this, "pro-upgrade");
        }

        /** نصب‌بودن فروشگاه مایکت روی دستگاه */
        @JavascriptInterface
        public String myketStatus() {
            JSONObject res = new JSONObject();
            try {
                res.put("installed", myketBilling != null && myketBilling.isMarketInstalled());
                res.put("bound", myketBilling != null && myketBilling.isBound());
            } catch (Exception ignored) { }
            return res.toString();
        }
    }

    /* ───────────── دانلود و نصب ───────────── */

    private void downloadAndInstallImpl(String urlStr, String version) {
        File dir = getExternalFilesDir("updates");
        if (dir == null) dir = getFilesDir();
        if (!dir.exists()) dir.mkdirs();
        final File apk = new File(dir, "AntiHack-v" + version + ".apk");
        try {
            HttpURLConnection c = (HttpURLConnection) new URL(urlStr).openConnection();
            c.setConnectTimeout(15000);
            c.setReadTimeout(60000);
            c.setRequestProperty("User-Agent", "AntiHack-App");
            int code = c.getResponseCode();
            if (code < 200 || code >= 300) throw new Exception("HTTP " + code);

            long total = c.getContentLength();
            InputStream in = new BufferedInputStream(c.getInputStream());
            FileOutputStream out = new FileOutputStream(apk);
            byte[] buf = new byte[8192];
            long read = 0;
            int lastPct = -1;
            int n;
            while ((n = in.read(buf)) != -1) {
                out.write(buf, 0, n);
                read += n;
                if (total > 0) {
                    int pct = (int) (read * 100 / total);
                    if (pct != lastPct) {
                        lastPct = pct;
                        jsEval("window.__updateProgress && window.__updateProgress(" + pct + ")");
                    }
                }
            }
            out.flush();
            out.close();
            in.close();

            jsEval("window.__updateProgress && window.__updateProgress(100)");
            jsEval("window.__updateResult && window.__updateResult(true)");
            installApk(apk);
        } catch (Exception e) {
            try { apk.delete(); } catch (Exception ignored) { }
            jsEval("window.__updateResult && window.__updateResult(false, 'خطا در دانلود بروزرسانی؛ اتصال اینترنت را بررسی کنید')");
        }
    }

    private void installApk(File apk) {
        try {
            Uri uri;
            if (Build.VERSION.SDK_INT >= 24) {
                // از اندروید ۷ به بالا باید از content:// امن استفاده شود
                uri = new Uri.Builder()
                        .scheme("content")
                        .authority(getPackageName() + ".update")
                        .encodedPath(apk.getAbsolutePath())
                        .build();
            } else {
                uri = Uri.fromFile(apk);
            }
            Intent i = new Intent(Intent.ACTION_VIEW);
            i.setDataAndType(uri, "application/vnd.android.package-archive");
            i.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            startActivity(i);
        } catch (Exception e) {
            jsEval("window.__updateResult && window.__updateResult(false, 'بازکردن صفحه نصب ناموفق بود')");
        }
    }

    /* ───────────── چرخه عمر ───────────── */

    @Override
    public void onBackPressed() {
        // بازگشت پشته‌ای داخل اپ؛ در صفحه اصلی از برنامه خارج می‌شود
        webView.evaluateJavascript(
            "window.__handleBack ? (window.__handleBack() ? '1' : '0') : '0'",
            new ValueCallback<String>() {
                @Override
                public void onReceiveValue(String value) {
                    if (value == null || !value.contains("1")) {
                        finish();
                    }
                }
            });
    }

    @Override
    protected void onDestroy() {
        if (myketBilling != null) {
            myketBilling.unbind();
        }
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
