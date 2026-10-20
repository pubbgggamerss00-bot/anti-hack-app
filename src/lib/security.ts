import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'

/** متن دیسکلیمر آنبوردینگ (اولین اجرا — مثل اپ اصلی) */
export const DISCLAIMER_TEXT = `هدف این برنامه افزایش سطح آگاهی سایبری عموم مردم، تامین امنیت شبکه‌های اجتماعی و حفظ حریم خصوصی است. تمامی محتواها و کدهای موجود به صورت کاملاً مستقل و ۱۰۰٪ آفلاین توسعه یافته است.

هشدار بسیار حیاتی: این برنامه یک ابزار آموزشی و پایشی است و هیچ‌گاه برای نفوذ به سیستم دیگران استفاده نمی‌شود. مسئولیت استفاده غیرقانونی از محتوای آموزشی بر عهده فرد است. پیش از هرگونه لغو دسترسی، از کاربرد اصلی برنامه مطمئن شوید؛ لغو دسترسی برخی برنامه‌های سیستمی ممکن است به عملکرد گوشی آسیب بزند.`

/** محاسبه امتیاز و مسائل امنیتی بر اساس وضعیت دستگاه شبیه‌سازی‌شده */
export function computeSecurityFindings(state: {
  screenLock: string
  usbDebugging: boolean
  playProtect: boolean
  unknownSources: boolean
  securityPatch: string
  findMyDevice: boolean
  simPin: boolean
  autoUpdates: boolean
  notifUnlocked: boolean
}, apps: Array<{
  packageName: string
  name: string
  isDeviceAdmin: boolean
  isAccessibility: boolean
  isOverlay: boolean
  isUsageAccess: boolean
  isSuspicious: boolean
  signatureOk: boolean
  hasLauncherIcon: boolean
  isGooglePackage: boolean
  isSystem: boolean
}>) {
  const issues: Array<{
    id: string
    severity: 'critical' | 'high' | 'medium' | 'low'
    title: string
    detail: string
    fixable: boolean
    fixAction?: string
  }> = []
  let score = 100

  if (state.screenLock === 'none') {
    issues.push({ id: 'screen-lock', severity: 'critical', title: 'قفل صفحه فعال نیست', detail: 'بررسی قفل صفحه، وضعیت حافظه امنیتی، فیس‌آیدی و اثر انگشت — گوشی شما بدون قفل است!', fixable: true, fixAction: 'enable-screen-lock' })
    score -= 20
  } else if (state.screenLock === 'pattern' || state.screenLock === 'pin') {
    issues.push({ id: 'screen-lock', severity: 'low', title: 'قفل صفحه ساده', detail: 'الگو یا پین ساده امنیت کافی ندارد؛ بهتر است اثر انگشت فعال شود.', fixable: true, fixAction: 'enable-screen-lock' })
    score -= 6
  }

  if (state.usbDebugging) {
    issues.push({ id: 'usb-debugging', severity: 'high', title: 'عیب‌یابی USB روشن است', detail: 'بررسی وضعیت عیب‌یابی USB (Developer options)... [هشدار: روشن است - تضعیف ایمنی]', fixable: true, fixAction: 'disable-usb' })
    score -= 12
  }

  if (!state.playProtect) {
    issues.push({ id: 'play-protect', severity: 'high', title: 'Google Play Protect غیرفعال است', detail: 'اسکن سیستم با موتور زنده گوگل برای یافتن ماژول‌های بدافزار و جاسوسی از کار افتاده است.', fixable: true, fixAction: 'enable-play-protect' })
    score -= 12
  }

  if (state.unknownSources) {
    issues.push({ id: 'unknown-sources', severity: 'high', title: 'نصب برنامه از مراجع ناشناس باز است', detail: 'دسترسی برنامه‌های پیام‌رسان یا مرورگر به نصب فایل‌های APK مشکوک فعال است.', fixable: true, fixAction: 'disable-unknown-sources' })
    score -= 10
  }

  if (!state.findMyDevice) {
    issues.push({ id: 'find-my-device', severity: 'medium', title: 'سرویس Find My Device خاموش است', detail: 'امکان ردیابی، قفل و پاکسازی از راه دور تلفن همراه وجود ندارد.', fixable: true, fixAction: 'enable-fmd' })
    score -= 6
  }

  if (!state.simPin) {
    issues.push({ id: 'sim-pin', severity: 'medium', title: 'سیم‌کارت فاقد پین کد است', detail: 'در صورت سرقت فیزیکی گوشی، سیم‌کارت روی دستگاه دیگری قابل استفاده است.', fixable: true, fixAction: 'enable-sim-pin' })
    score -= 5
  }

  if (!state.autoUpdates) {
    issues.push({ id: 'auto-updates', severity: 'medium', title: 'بروزرسانی خودکار غیرفعال است', detail: 'وصله‌های امنیتی ماهانه گوگل پلی به‌صورت خودکار نصب نمی‌شوند.', fixable: true, fixAction: 'enable-updates' })
    score -= 6
  }

  if (state.notifUnlocked) {
    issues.push({ id: 'notif', severity: 'low', title: 'اعلان‌ها بدون محدودیت هستند', detail: 'محدود ساختن دسترسی نوتیفیکیشن‌ها برای جلوگیری از سرقت کدهای یکبارمصرف بانکی توصیه می‌شود.', fixable: true, fixAction: 'restrict-notif' })
    score -= 3
  }

  const patchDate = new Date(state.securityPatch).getTime()
  const sixMonths = Date.now() - 180 * 86400000
  if (patchDate < sixMonths) {
    issues.push({ id: 'security-patch', severity: 'high', title: 'وصله امنیتی سیستم‌عامل قدیمی است', detail: `آخرین وصله امنیتی: ${state.securityPatch} — آپدیت همیشگی سیستم‌عامل اندروید و آپدیت امنیتی ماهانه گوگل پلی الزامی است.`, fixable: true, fixAction: 'update-patch' })
    score -= 10
  }

  // برنامه‌های مشکوک
  const suspicious = apps.filter((a) => a.isSuspicious)
  if (suspicious.length > 0) {
    issues.push({
      id: 'suspicious-apps',
      severity: 'critical',
      title: `${suspicious.length} برنامه مشکوک/جاسوسی یافت شد`,
      detail: `امضای بسته‌های زیر سالم نیست یا رفتار مخرب دارند: ${suspicious.map((s) => s.name).join('، ')}`,
      fixable: true,
      fixAction: 'remove-suspicious',
    })
    score -= Math.min(15, suspicious.length * 3)
  }

  const adminApps = apps.filter((a) => a.isDeviceAdmin && !a.isGooglePackage)
  if (adminApps.length > 0) {
    issues.push({ id: 'device-admin', severity: 'high', title: 'دسترسی ادمین مشکوک فعال است', detail: `برنامه‌های دارای Device Admin: ${adminApps.map((a) => a.name).join('، ')}`, fixable: true, fixAction: 'revoke-admin' })
    score -= 6
  }

  const accApps = apps.filter((a) => a.isAccessibility && !a.isGooglePackage)
  if (accApps.length > 0) {
    issues.push({ id: 'accessibility', severity: 'high', title: 'سرویس Accessibility مزاحم فعال است', detail: `برنامه‌های زیر رفتارهای حرکتی و کلیک‌های شما را ثبت می‌کنند: ${accApps.map((a) => a.name).join('، ')}`, fixable: true, fixAction: 'revoke-accessibility' })
    score -= 6
  }

  const overlayApps = apps.filter((a) => a.isOverlay && !a.isGooglePackage)
  if (overlayApps.length > 0) {
    issues.push({ id: 'overlay', severity: 'medium', title: 'برنامه‌های Overlay (حباب شناور) فعال هستند', detail: `ردیابی برنامه‌هایی که توانایی ترسیم روی صفحه نمایشگر دارند: ${overlayApps.map((a) => a.name).join('، ')}`, fixable: true, fixAction: 'revoke-overlay' })
    score -= 4
  }

  const hiddenApps = apps.filter((a) => !a.hasLauncherIcon && !a.isSystem && !a.isGooglePackage)
  if (hiddenApps.length > 0) {
    issues.push({ id: 'hidden-apps', severity: 'high', title: `${hiddenApps.length} برنامه پنهان بدون آیکون یافت شد`, detail: 'برنامه‌های نصب‌شده توسط کاربر که فاقد آیکون شلیک‌کننده (پرتابگر) هستند؛ معمولاً جاسوس‌افزارها هستند.', fixable: true, fixAction: 'remove-hidden' })
    score -= 8
  }

  score = Math.max(12, Math.min(100, score))
  return { score, issues }
}

/** توکن فعالساز داخلی برای ثبت سوابق خرید (الگوریتم مشتق از کد دستگاه) */
export function deriveToken(deviceCode: string): string {
  const h = createHash('sha256').update(`abbastech-ainthack-${deviceCode.toUpperCase()}`).digest('hex').toUpperCase()
  const seg = (i: number) => h.slice(i * 4, i * 4 + 4)
  return `PRO-${seg(0)}-${seg(1)}-${seg(2)}`
}

export function generateDeviceCode(seed: string): string {
  const h = createHash('sha256').update(seed).digest('hex').toUpperCase()
  return `${h.slice(0, 4)}-${h.slice(4, 8)}-${h.slice(8, 12)}`
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export async function GET(req: NextRequest) {
  return NextResponse.json({ ok: true, message: 'ضد هک API — سالم' })
}
