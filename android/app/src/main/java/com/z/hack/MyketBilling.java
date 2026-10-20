package com.z.hack;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;

import org.json.JSONObject;

import java.util.List;

import ir.myket.billingclient.IabHelper;
import ir.myket.billingclient.util.IabException;
import ir.myket.billingclient.util.IabResult;
import ir.myket.billingclient.util.Inventory;
import ir.myket.billingclient.util.Purchase;

/**
 * خرید درون‌برنامه‌ای فروشگاه مایکت با کتابخانه رسمی
 * com.github.myketstore:myket-billing-client (JitPack) — کلاس IabHelper.
 * محصول: «اشتراک پرو» با شناسه Pro (محصول مدیریتی/غیرمصرفی)
 * کلید عمومی از BuildConfig.IAB_PUBLIC_KEY (طبق دستورالعمل رسمی مایکت) خوانده می‌شود؛
 * امضای تراکنش‌ها توسط کتابخانه با همان کلید تایید می‌شود و خرید بدون امضای معتبر فعال نمی‌گردد.
 */
public class MyketBilling {

    public static final String MARKET_PACKAGE = "ir.mservices.market";
    public static final String SKU_PRO = "Pro";
    public static final int REQ_PURCHASE = 7331;

    /** رویدادها به صورت JSON به لایه JS منتقل می‌شوند */
    public interface Listener {
        void onBillingEvent(String json);
    }

    private final Context ctx;
    private final Handler main;
    private final Listener listener;
    private IabHelper helper;
    private volatile boolean setupDone = false;
    private volatile boolean setupFailed = false;
    private volatile boolean ownershipChecked = false;

    public MyketBilling(Context ctx, Listener listener) {
        this.ctx = ctx;
        this.main = new Handler(Looper.getMainLooper());
        this.listener = listener;
    }

    /* ─────────── وضعیت ─────────── */

    /** آیا مایکت روی دستگاه نصب است؟ */
    public boolean isMarketInstalled() {
        try {
            return ctx.getPackageManager().getLaunchIntentForPackage(MARKET_PACKAGE) != null;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isBound() {
        return setupDone && helper != null;
    }

    /* ─────────── راه‌اندازی کتابخانه رسمی مایکت ─────────── */

    /** معادل bind قبلی — راه‌اندازی IabHelper و اتصال به سرویس/برادکست مایکت */
    public void bind() {
        if (helper != null || !isMarketInstalled()) return;
        try {
            helper = new IabHelper(ctx, BuildConfig.IAB_PUBLIC_KEY);
            helper.enableDebugLogging(false);
            helper.startSetup(new IabHelper.OnIabSetupFinishedListener() {
                @Override
                public void onIabSetupFinished(IabResult result) {
                    if (result == null) {
                        setupFailed = true;
                        return;
                    }
                    if (result.isSuccess()) {
                        setupDone = true;
                        setupFailed = false;
                        /* پس از اتصال، خریدهای قبلی کاربر برای فعال‌سازی خودکار بررسی می‌شود */
                        new Thread(new Runnable() {
                            @Override
                            public void run() {
                                JSONObject res = queryOwnership();
                                ownershipChecked = true;
                                if (listener != null && res.optBoolean("ok")) {
                                    listener.onBillingEvent(res.toString());
                                }
                            }
                        }).start();
                    } else {
                        setupFailed = true;
                    }
                }
            });
        } catch (Exception e) {
            helper = null;
            setupFailed = true;
        }
    }

    /** تلاش مجدد راه‌اندازی تا مهلت مشخص (رفع حالت اتصال ناتمام هنگام خرید سریع) */
    private void ensureSetup(long timeoutMs) {
        long deadline = System.currentTimeMillis() + timeoutMs;
        if (helper == null) bind();
        while (!setupDone && helper != null && System.currentTimeMillis() < deadline) {
            try { Thread.sleep(200); } catch (InterruptedException e) { break; }
        }
    }

    public void unbind() {
        if (helper != null) {
            try { helper.dispose(); } catch (Exception ignored) { }
            helper = null;
        }
        setupDone = false;
    }

    /* ─────────── بررسی مالکیت (بازیابی خرید) ─────────── */

    /**
     * بررسی خریدهای قبلی کاربر؛ در صورت مالکیت «Pro» نتیجه ok:true و owned:true برمی‌گردد.
     * امضای خریدها داخل کتابخانه با کلید عمومی تایید می‌شود (queryInventory).
     * فراخوانی روی ترد جاری (ترد پس‌زمینه) انجام می‌شود.
     */
    public JSONObject queryOwnership() {
        JSONObject res = new JSONObject();
        try {
            res.put("type", "ownership");
            if (!isMarketInstalled()) {
                res.put("ok", false);
                res.put("error", "market_missing");
                return res;
            }
            ensureSetup(4000);
            if (helper == null || !setupDone) {
                res.put("ok", false);
                res.put("error", "not_bound");
                return res;
            }
            Inventory inv = helper.queryInventory(false, (List<String>) null);
            Purchase p = inv != null ? inv.getPurchase(SKU_PRO) : null;
            res.put("ok", true);
            res.put("owned", p != null);
            return res;
        } catch (IabException e) {
            try {
                res.put("ok", false);
                res.put("error", "query_failed");
                res.put("code", e.getResult() != null ? e.getResult().getResponse() : -1);
                String m = e.getMessage();
                if (m != null) res.put("detailMsg", m.length() > 300 ? m.substring(0, 300) : m);
            } catch (Exception ignored) { }
            return res;
        } catch (Exception e) {
            try {
                res.put("ok", false);
                res.put("error", "exception");
                res.put("detail", e.getClass().getSimpleName());
                String m = e.getMessage();
                if (m != null) res.put("detailMsg", m.length() > 300 ? m.substring(0, 300) : m);
            } catch (Exception ignored) { }
            return res;
        }
    }

    /** نسخه همگام برای فراخوانی از پل جاوااسکریپت (ترد پس‌زمینه) */
    public String checkOwnershipJson() {
        return queryOwnership().toString();
    }

    /* ─────────── شروع فرایند خرید ─────────── */

    /**
     * بازکردن صفحه خرید مایکت با launchPurchaseFlow کتابخانه رسمی.
     * نتیجه نهایی از طریق onIabPurchaseFinished (روی ترد اصلی) به JS ارسال می‌شود؛
     * ProxyBillingActivity داخل کتابخانه نتیجه را دریافت می‌کند و نیازی به onActivityResult نیست.
     * خروجی JSON: {launched:true} یا {ok:false,error/...}
     */
    public String buy(final Activity activity, final String payload) {
        JSONObject res = new JSONObject();
        try {
            if (!isMarketInstalled()) {
                res.put("ok", false);
                res.put("error", "market_missing");
                return res.toString();
            }
            ensureSetup(4000);
            if (helper == null || !setupDone) {
                res.put("ok", false);
                res.put("error", "not_bound");
                return res.toString();
            }
            final String devPayload =
                    payload != null ? payload : ("pro:" + System.currentTimeMillis());
            main.post(new Runnable() {
                @Override
                public void run() {
                    try {
                        /* امضای کتابخانه رسمی: launchPurchaseFlow(activity, sku, itemType, listener, extraData)
                           نتیجه از طریق ProxyBillingActivity داخل کتابخانه دریافت می‌شود */
                        helper.launchPurchaseFlow(activity, SKU_PRO, "inapp",
                                new IabHelper.OnIabPurchaseFinishedListener() {
                                    @Override
                                    public void onIabPurchaseFinished(IabResult result, Purchase info) {
                                        emitPurchaseResult(result, info);
                                    }
                                }, devPayload);
                    } catch (Exception e) {
                        emitLaunchError(e);
                    }
                }
            });
            res.put("launched", true);
            return res.toString();
        } catch (Exception e) {
            emitLaunchError(e);
            try { res.put("ok", false); res.put("error", "exception"); } catch (Exception ignored) { }
            return res.toString();
        }
    }

    private void emitLaunchError(Exception e) {
        if (listener == null) return;
        JSONObject err = new JSONObject();
        try {
            err.put("type", "purchase");
            err.put("ok", false);
            err.put("error", "exception");
            err.put("detail", e.getClass().getSimpleName());
            String m = e.getMessage();
            if (m != null) err.put("detailMsg", m.length() > 300 ? m.substring(0, 300) : m);
        } catch (Exception ignored) { }
        listener.onBillingEvent(err.toString());
    }

    /* ─────────── نتیجه خرید (از کتابخانه رسمی) ─────────── */

    /**
     * بازگشت: {type:'purchase', ok:true, owned:true} یا خطاها (code / canceled / invalid_signature)
     * کدهای استاندارد IAB v3: 1=لغو کاربر، 7=قبلاً مالک‌شده، کدهای منفی = خطاهای داخلی کتابخانه
     */
    private void emitPurchaseResult(IabResult result, Purchase purchase) {
        JSONObject res = new JSONObject();
        try {
            res.put("type", "purchase");
            int code = result != null ? result.getResponse() : IabHelper.IABHELPER_UNKNOWN_ERROR;

            if (result != null && result.isSuccess() && purchase != null) {
                if (SKU_PRO.equals(purchase.getSku())) {
                    res.put("ok", true);
                    res.put("owned", true);
                    res.put("orderId", purchase.getOrderId());
                    res.put("purchaseTime", purchase.getPurchaseTime());
                } else {
                    res.put("ok", false);
                    res.put("error", "wrong_product");
                }
            } else if (code == IabHelper.BILLING_RESPONSE_RESULT_USER_CANCELED
                    || code == IabHelper.IABHELPER_USER_CANCELLED) {
                res.put("ok", false);
                res.put("code", code);
                res.put("canceled", true);
            } else if (code == IabHelper.BILLING_RESPONSE_RESULT_ITEM_ALREADY_OWNED) {
                res.put("ok", true);
                res.put("owned", true);
                res.put("code", code);
            } else if (code == IabHelper.IABHELPER_VERIFICATION_FAILED
                    || code == IabHelper.IABHELPER_BAD_RESPONSE) {
                res.put("ok", false);
                res.put("error", "invalid_signature");
            } else {
                res.put("ok", false);
                res.put("code", code);
                String m = result != null ? result.getMessage() : null;
                if (m != null) res.put("detailMsg", m.length() > 300 ? m.substring(0, 300) : m);
            }
            if (listener != null) listener.onBillingEvent(res.toString());
        } catch (Exception ignored) { }
    }

    public boolean isOwnershipChecked() {
        return ownershipChecked;
    }
}
