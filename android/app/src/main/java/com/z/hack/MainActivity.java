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

import org.json.JSONObject;

/**
 * اپلیکیشن امنیتی «ضد هک» — کاملاً آفلاین.
 * تمام محتوا (۲۰ درس آموزشی، ۱۳ ابزار امنیتی، میانبرها و چک‌لیست) به‌صورت
 * کاملاً محلی در assets برنامه قرار دارد و هیچ داده‌ای از دستگاه خارج نمی‌شود؛
 * تنها اتصال شبکه، تراکنش خرید درون‌برنامه‌ای مایکت (ارتقا به نسخه پرو) است.
 */
public class MainActivity extends Activity {

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

        // پل ارتباطی جاوااسکریپت ↔ اندروید برای خرید درون‌برنامه‌ای مایکت و امتیازدهی
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

        /**
         * بازکردن صفحه ثبت نظر و امتیازدهی برنامه در مایکت — طبق مستندات رسمی:
         * myket://comment?id=PACKAGE با Intent.ACTION_VIEW
         * (پس از نمایش دیالوگ تأیید در سمت جاوااسکریپت فراخوانی می‌شود)
         */
        @JavascriptInterface
        public String myketComment() {
            JSONObject res = new JSONObject();
            try {
                Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse("myket://comment?id=" + getPackageName()));
                i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                startActivity(i);
                res.put("ok", true);
            } catch (Exception e) {
                /* مایکت نصب نیست یا صفحه نظر باز نشد — جاوااسکریپت پیام مناسب نمایش می‌دهد */
                try {
                    res.put("ok", false);
                    res.put("marketInstalled", myketBilling != null && myketBilling.isMarketInstalled());
                } catch (Exception ignored) { }
            }
            return res.toString();
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
