package com.abbastech.antihack;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.webkit.ValueCallback;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

/**
 * اپلیکیشن امنیتی «ضد هک» — نسخه ۱۰۰٪ آفلاین
 * تمام محتوا (۲۰ درس آموزشی، ۱۳ ابزار امنیتی، میانبرها و چک‌لیست) به‌صورت
 * کاملاً محلی در assets برنامه قرار دارد و هیچ داده‌ای از دستگاه خارج نمی‌شود.
 */
public class MainActivity extends Activity {

    private WebView webView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        webView = new WebView(this);
        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(false);
        s.setLoadsImagesAutomatically(true);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);

        webView.setWebViewClient(new WebViewClient());
        webView.setBackgroundColor(Color.rgb(20, 24, 38));
        webView.setVerticalScrollBarEnabled(false);
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        // پس‌زمینه ناوبری همرنگ تم سرمه‌ای برنامه
        Window w = getWindow();
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            w.setStatusBarColor(Color.rgb(20, 24, 38));
            w.setNavigationBarColor(Color.rgb(20, 24, 38));
            w.getDecorView().setSystemUiVisibility(0);
        }

        webView.loadUrl("file:///android_asset/index.html");
        setContentView(webView);
    }

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
        if (webView != null) {
            webView.destroy();
        }
        super.onDestroy();
    }
}
