package com.z.hack;

/**
 * پیکربندی ساخت — معادل خروجی استاندارد Gradle BuildConfig.
 * کلید عمومی صورت‌حساب مایکت (RSA PublicKey) از پنل توسعه‌دهندگان مایکت
 * و مطابق دستورالعمل رسمی در buildConfigField با نام IAB_PUBLIC_KEY نگهداری می‌شود.
 */
public final class BuildConfig {

    public static final boolean DEBUG = false;

    /** کلید عمومی مایکت برای تایید امضای تراکنش‌های خرید (محصول: اشتراک پرو، شناسه Pro) */
    public static final String IAB_PUBLIC_KEY =
            "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC5AGs0rrIS+ALGSG9ZmOU/HlVRThUNZ74p1ipWiWsGkfgY3iPKvHGm9AozsmQGw0xZ7OYn88j7Dl8K5ejXaBbFj1wB+dLrVN25ygKWsLdAjDRKk9egUP9VRDiAIjTHYYiiv2PPzHrfs2wiPQNjZQ0qlYdbPEa1rMqbELj2vhaWdQIDAQAB";

    private BuildConfig() { }
}
