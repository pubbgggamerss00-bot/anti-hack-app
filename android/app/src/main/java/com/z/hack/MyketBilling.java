package com.z.hack;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.ServiceConnection;
import android.content.ComponentName;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.os.RemoteException;
import android.util.Base64;

import org.json.JSONObject;

import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.X509EncodedKeySpec;
import java.util.ArrayList;

import ir.mservices.market.IInAppBillingService;

/**
 * اتصال و خرید درون‌برنامه‌ای فروشگاه مایکت (IAB v3)
 * محصول: «اشتراک پرو» با شناسه Pro (محصول مدیریتی/غیرمصرفی)
 * امضای تراکنش‌ها با کلید عمومی مایکت تایید می‌شود؛ خرید بدون امضای معتبر فعال نمی‌گردد.
 */
public class MyketBilling {

    public static final String MARKET_PACKAGE = "ir.mservices.market";
    public static final String SKU_PRO = "Pro";
    public static final int REQ_PURCHASE = 7331;

    private static final String PUBLIC_KEY =
            "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC5AGs0rrIS+ALGSG9ZmOU/HlVRThUNZ74p1ipWiWsGkfgY3iPKvHGm9AozsmQGw0xZ7OYn88j7Dl8K5ejXaBbFj1wB+dLrVN25ygKWsLdAjDRKk9egUP9VRDiAIjTHYYiiv2PPzHrfs2wiPQNjZQ0qlYdbPEa1rMqbELj2vhaWdQIDAQAB";

    /* کدهای پاسخ استاندارد صورت‌حساب v3 */
    public static final int BILLING_OK = 0;
    public static final int USER_CANCELED = 1;
    public static final int BILLING_UNAVAILABLE = 2;
    public static final int ITEM_UNAVAILABLE = 4;
    public static final int ITEM_ALREADY_OWNED = 7;

    /** رویدادها به صورت JSON به لایه JS منتقل می‌شوند */
    public interface Listener {
        void onBillingEvent(String json);
    }

    private final Context ctx;
    private final Handler main;
    private final Listener listener;
    private IInAppBillingService service;
    private boolean bound = false;
    private volatile boolean ownershipChecked = false;

    private final ServiceConnection conn = new ServiceConnection() {
        @Override
        public void onServiceConnected(ComponentName name, IBinder binder) {
            service = IInAppBillingService.Stub.asInterface(binder);
            // پس از اتصال، خریدهای قبلی کاربر برای فعال‌سازی خودکار بررسی می‌شود
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
        }

        @Override
        public void onServiceDisconnected(ComponentName name) {
            service = null;
        }
    };

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
        return bound && service != null;
    }

    /** اتصال به سرویس صورت‌حساب مایکت */
    public void bind() {
        if (bound || !isMarketInstalled()) return;
        try {
            Intent i = new Intent("ir.mservices.market.InAppBillingService.BIND");
            i.setPackage(MARKET_PACKAGE);
            bound = ctx.bindService(i, conn, Context.BIND_AUTO_CREATE);
        } catch (Exception e) {
            bound = false;
        }
    }

    /**
     * اطمینان از اتصال سرویس پیش از هر عملیات؛ اگر اتصال اولیه هنوز برقرار نشده باشد
     * دوباره تلاش می‌کند و حداکثر تا timeout منتظر onServiceConnected می‌ماند.
     * (رفع خطای «not_bound» هنگامی که کاربر سریع به صفحه خرید می‌رود)
     */
    private boolean ensureBound(long timeoutMs) {
        long deadline = System.currentTimeMillis() + timeoutMs;
        while (service == null && System.currentTimeMillis() < deadline) {
            bind(); /* اگر اتصال قبلی ناموفق بوده، دوباره تلاش می‌شود */
            try { Thread.sleep(200); } catch (InterruptedException e) { break; }
        }
        return service != null;
    }

    public void unbind() {
        if (bound) {
            try { ctx.unbindService(conn); } catch (Exception ignored) { }
            bound = false;
        }
        service = null;
    }

    /* ─────────── بررسی مالکیت (بازیابی خرید) ─────────── */

    /**
     * بررسی خریدهای قبلی کاربر؛ در صورت مالکیت «Pro» نتیجه ok:true و owned:true برمی‌گردد.
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
            ensureBound(4000);
            if (service == null) {
                res.put("ok", false);
                res.put("error", "not_bound");
                return res;
            }
            int sup = service.isBillingSupported(3, ctx.getPackageName(), "inapp");
            if (sup != BILLING_OK) {
                res.put("ok", false);
                res.put("error", "unsupported");
                return res;
            }
            Bundle owned = service.getPurchases(3, ctx.getPackageName(), "inapp", null);
            int resp = owned.getInt("RESPONSE_CODE");
            if (resp != BILLING_OK) {
                res.put("ok", false);
                res.put("code", resp);
                return res;
            }
            ArrayList<String> dataList = owned.getStringArrayList("INAPP_PURCHASE_DATA_LIST");
            boolean hasPro = false;
            if (dataList != null) {
                for (String pd : dataList) {
                    try {
                        JSONObject o = new JSONObject(pd);
                        if (SKU_PRO.equals(o.optString("productId"))) {
                            hasPro = true;
                            break;
                        }
                    } catch (Exception ignored) { }
                }
            }
            res.put("ok", true);
            res.put("owned", hasPro);
            return res;
        } catch (RemoteException e) {
            try { res.put("ok", false); res.put("error", "remote"); } catch (Exception ignored) { }
            return res;
        } catch (Exception e) {
            try { res.put("ok", false); res.put("error", "exception"); } catch (Exception ignored) { }
            return res;
        }
    }

    /** نسخه همگام برای فراخوانی از پل جاوااسکریپت (ترد پس‌زمینه) */
    public String checkOwnershipJson() {
        return queryOwnership().toString();
    }

    /* ─────────── شروع فرایند خرید ─────────── */

    /**
     * دریافت BuyIntent از مایکت و بازکردن صفحه خرید.
     * در پل JS اجرا می‌شود (ترد پس‌زمینه)؛ بازکردن صفحه روی ترد اصلی انجام می‌گیرد.
     * خروجی JSON: {launched:true} یا {ok:false,error/code}
     */
    public String buy(final Activity activity, final String payload) {
        JSONObject res = new JSONObject();
        try {
            if (!isMarketInstalled()) {
                res.put("ok", false);
                res.put("error", "market_missing");
                return res.toString();
            }
            if (!ensureBound(4000)) {
                res.put("ok", false);
                res.put("error", "not_bound");
                return res.toString();
            }
            Bundle buy = service.getBuyIntent(3, ctx.getPackageName(), SKU_PRO, "inapp",
                    payload != null ? payload : ("pro:" + System.currentTimeMillis()));
            int resp = buy.getInt("RESPONSE_CODE");
            if (resp == ITEM_ALREADY_OWNED) {
                res.put("ok", false);
                res.put("code", ITEM_ALREADY_OWNED);
                res.put("owned", true);
                return res.toString();
            }
            if (resp != BILLING_OK) {
                res.put("ok", false);
                res.put("code", resp);
                res.put("error", "billing_code");
                return res.toString();
            }
            // استخراج PendingIntent صفحه خرید (الگوی استاندارد IabHelper)
            buy.setClassLoader(android.app.PendingIntent.class.getClassLoader());
            android.app.PendingIntent pend = buy.getParcelable("BUY_INTENT");
            if (pend == null) {
                res.put("ok", false);
                res.put("error", "no_intent");
                return res.toString();
            }
            final android.app.PendingIntent pendingIntent = pend;
            main.post(new Runnable() {
                @Override
                public void run() {
                    try {
                        activity.startIntentSenderForResult(pendingIntent.getIntentSender(),
                                REQ_PURCHASE, new Intent(), 0, 0, 0);
                    } catch (Exception e) {
                        if (listener != null) {
                            JSONObject err = new JSONObject();
                            try { err.put("type", "purchase"); err.put("ok", false); err.put("error", "launch_failed"); }
                            catch (Exception ignored) { }
                            listener.onBillingEvent(err.toString());
                        }
                    }
                }
            });
            res.put("launched", true);
            return res.toString();
        } catch (SecurityException se) {
            /* مایکت شروع خرید را رد کرد؛ معمولاً یعنی دسترسی صورت‌حساب کامل نیست
               یا برنامه/محصول در پنل مایکت با همین پکیج و امضا ثبت/فعال نشده است */
            try {
                res.put("ok", false);
                res.put("error", "security");
                res.put("detail", "SecurityException");
                String m = se.getMessage();
                if (m != null) res.put("detailMsg", m.length() > 300 ? m.substring(0, 300) : m);
            } catch (Exception ignored) { }
            return res.toString();
        } catch (RemoteException e) {
            try { res.put("ok", false); res.put("error", "remote"); } catch (Exception ignored) { }
            return res.toString();
        } catch (Exception e) {
            try {
                res.put("ok", false);
                res.put("error", "exception");
                res.put("detail", e.getClass().getSimpleName());
                String m = e.getMessage();
                if (m != null) res.put("detailMsg", m.length() > 300 ? m.substring(0, 300) : m);
            } catch (Exception ignored) { }
            return res.toString();
        }
    }

    /* ─────────── نتیجه خرید (onActivityResult) ─────────── */

    /**
     * اگر نتیجه متعلق به فرایند خرید مایکت باشد true برمی‌گرداند و رویداد JSON ارسال می‌کند.
     * بازگشت: {type:'purchase', ok:true, owned:true} یا خطاها (code / canceled / invalid_signature)
     */
    public boolean handleActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode != REQ_PURCHASE) return false;

        JSONObject res = new JSONObject();
        try {
            res.put("type", "purchase");
            int responseCode;
            if (data == null) {
                responseCode = resultCode == Activity.RESULT_OK ? BILLING_OK : USER_CANCELED;
            } else {
                responseCode = data.getIntExtra("RESPONSE_CODE",
                        resultCode == Activity.RESULT_OK ? BILLING_OK : USER_CANCELED);
            }

            if (responseCode == USER_CANCELED) {
                res.put("ok", false);
                res.put("code", USER_CANCELED);
                res.put("canceled", true);
                if (listener != null) listener.onBillingEvent(res.toString());
                return true;
            }

            if (responseCode == ITEM_ALREADY_OWNED) {
                res.put("ok", true);
                res.put("owned", true);
                res.put("code", ITEM_ALREADY_OWNED);
                if (listener != null) listener.onBillingEvent(res.toString());
                return true;
            }

            if (responseCode != BILLING_OK) {
                res.put("ok", false);
                res.put("code", responseCode);
                if (listener != null) listener.onBillingEvent(res.toString());
                return true;
            }

            String purchaseData = data != null ? data.getStringExtra("INAPP_PURCHASE_DATA") : null;
            String dataSignature = data != null ? data.getStringExtra("INAPP_DATA_SIGNATURE") : null;

            if (purchaseData == null || dataSignature == null) {
                res.put("ok", false);
                res.put("error", "no_purchase_data");
                if (listener != null) listener.onBillingEvent(res.toString());
                return true;
            }

            JSONObject p = new JSONObject(purchaseData);
            String productId = p.optString("productId");

            if (!SKU_PRO.equals(productId)) {
                res.put("ok", false);
                res.put("error", "wrong_product");
                if (listener != null) listener.onBillingEvent(res.toString());
                return true;
            }

            if (!verifySignature(purchaseData, dataSignature)) {
                res.put("ok", false);
                res.put("error", "invalid_signature");
                if (listener != null) listener.onBillingEvent(res.toString());
                return true;
            }

            res.put("ok", true);
            res.put("owned", true);
            res.put("orderId", p.optString("orderId"));
            res.put("purchaseTime", p.optLong("purchaseTime"));
            if (listener != null) listener.onBillingEvent(res.toString());
            return true;
        } catch (Exception e) {
            try {
                res.put("ok", false);
                res.put("error", "exception");
                if (listener != null) listener.onBillingEvent(res.toString());
            } catch (Exception ignored) { }
            return true;
        }
    }

    /* ─────────── تایید امضای تراکنش با کلید عمومی مایکت ─────────── */

    private boolean verifySignature(String signedData, String signature) {
        try {
            byte[] keyBytes = Base64.decode(PUBLIC_KEY, Base64.DEFAULT);
            X509EncodedKeySpec spec = new X509EncodedKeySpec(keyBytes);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            PublicKey pk = kf.generatePublic(spec);
            Signature sig = Signature.getInstance("SHA1withRSA");
            sig.initVerify(pk);
            sig.update(signedData.getBytes("UTF-8"));
            return sig.verify(Base64.decode(signature, Base64.DEFAULT));
        } catch (Exception e) {
            return false;
        }
    }

    public boolean isOwnershipChecked() {
        return ownershipChecked;
    }
}
