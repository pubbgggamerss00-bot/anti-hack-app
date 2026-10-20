'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import {
  Crown, Moon, Sun, Type, ShieldCheck, Info, Smartphone, CheckCircle2,
  RefreshCw, Download, Loader2, ChevronLeft, Sparkles,
} from 'lucide-react'

const FONTS = [
  { key: 'sm', label: 'کوچک' },
  { key: 'md', label: 'متوسط' },
  { key: 'lg', label: 'بزرگ' },
  { key: 'xl', label: 'بسیار بزرگ' },
] as const

/** پل بومی اپ اندروید (WebView) — در نسخه وب وجود ندارد */
declare global {
  interface Window {
    AndroidBridge?: {
      getAppVersion?: () => string
      checkUpdate?: () => string
      downloadAndInstall?: (url: string, version: string) => void
    }
  }
}

/* نسخه فعلی برنامه (برای مقایسه با آخرین نسخه منتشرشده در گیت‌هاب) */
const APP_VERSION = '1.3.0'
const GH_RELEASE_API = 'https://api.github.com/repos/pubbgggamerss00-bot/anti-hack-app/releases/latest'

interface ReleaseInfo {
  latestVersion: string
  title: string
  changelog: string
  downloadUrl: string
  publishedAt: string
  isNewer: boolean
}

/** تبدیل ارقام لاتین به فارسی برای نمایش نسخه */
const faVer = (v: string | number) => String(v ?? '').replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)])

/** مقایسه نسخه‌ها: خروجی ۱ یعنی a جدیدتر از b */
function cmpVer(a: string, b: string): number {
  const pa = a.replace(/^v/i, '').split('.').map(x => parseInt(x, 10) || 0)
  const pb = b.replace(/^v/i, '').split('.').map(x => parseInt(x, 10) || 0)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] ?? 0) - (pb[i] ?? 0)
    if (d) return d > 0 ? 1 : -1
  }
  return 0
}

/** نمایش متن تغییرات (مارک‌داون گیت‌هاب) به‌صورت خوانا و امن */
function ChangelogBody({ md }: { md: string }) {
  const lines = md.replace(/\r/g, '').split('\n')
  return (
    <div className="max-h-48 overflow-y-auto rounded-2xl bg-muted/60 p-3 text-[11px] leading-6 text-foreground/85">
      {lines.map((ln, i) => {
        if (/^#{1,6}\s/.test(ln)) return <p key={i} className="font-extrabold">{ln.replace(/^#{1,6}\s+/, '')}</p>
        if (/^[-*]\s+/.test(ln)) return <p key={i}>• {ln.replace(/^[-*]\s+/, '').replace(/\*\*/g, '').replace(/`/g, '')}</p>
        if (!ln.trim()) return <div key={i} className="h-1.5" />
        return <p key={i}>{ln.replace(/\*\*/g, '').replace(/`/g, '')}</p>
      })}
    </div>
  )
}

export function SettingsScreen() {
  const { theme, setTheme, font, setFont, isPro, push, data } = useApp()
  const [checking, setChecking] = useState(false)
  const [updateOpen, setUpdateOpen] = useState(false)
  const [result, setResult] = useState<ReleaseInfo | null>(null)

  async function handleCheck() {
    if (checking) return
    setChecking(true)
    try {
      // در اپ اندروید (WebView): بررسی بومی از طریق پل
      if (window.AndroidBridge?.checkUpdate) {
        const raw = JSON.parse(window.AndroidBridge.checkUpdate())
        if (!raw.ok || !raw.latestVersion) throw new Error(raw.error ?? 'bad response')
        setResult({
          latestVersion: String(raw.latestVersion),
          title: String(raw.title ?? ''),
          changelog: String(raw.changelog ?? ''),
          downloadUrl: String(raw.downloadUrl ?? ''),
          publishedAt: String(raw.publishedAt ?? ''),
          isNewer: Boolean(raw.isNewer),
        })
      } else {
        // نسخه وب: فراخوانی مستقیم API گیت‌هاب
        const r = await fetch(GH_RELEASE_API, { headers: { Accept: 'application/vnd.github+json' } })
        if (!r.ok) {
          if (r.status === 403) {
            throw Object.assign(new Error('rate limit'), { rateLimit: true })
          }
          throw new Error(`HTTP ${r.status}`)
        }
        const j = await r.json()
        let apk = ''
        for (const a of j.assets ?? []) {
          if (/\.apk$/i.test(a.name ?? '') && !apk) apk = a.browser_download_url
        }
        const latest = String(j.tag_name ?? '').replace(/^v/i, '')
        if (!latest) throw new Error('bad release')
        setResult({
          latestVersion: latest,
          title: String(j.name ?? ''),
          changelog: String(j.body ?? ''),
          downloadUrl: apk,
          publishedAt: String(j.published_at ?? ''),
          isNewer: cmpVer(latest, APP_VERSION) > 0,
        })
      }
      setUpdateOpen(true)
    } catch (e) {
      if (e && typeof e === 'object' && 'rateLimit' in e) {
        toast.error('تعداد درخواست‌های بررسی بیش از حد مجاز است؛ چند دقیقه بعد دوباره تلاش کنید')
      } else {
        toast.error('بررسی بروزرسانی ناموفق بود؛ اتصال اینترنت دستگاه را بررسی کنید')
      }
    }
    setChecking(false)
  }

  function handleDownload() {
    if (!result?.downloadUrl) {
      toast.error('لینک دانلود نسخه جدید یافت نشد')
      return
    }
    if (window.AndroidBridge?.downloadAndInstall) {
      // اپ اندروید: دانلود بومی با نوار پیشرفت و بازشدن خودکار صفحه نصب
      setUpdateOpen(false)
      window.AndroidBridge.downloadAndInstall(result.downloadUrl, result.latestVersion)
      toast('در حال دریافت بروزرسانی از گیت‌هاب...')
    } else {
      // نسخه وب: انتقال به فایل APK
      toast('در حال انتقال به صفحه دریافت نسخه جدید...')
      window.open(result.downloadUrl, '_blank')
    }
  }

  return (
    <div className="space-y-3.5 pb-6">
      {/* وضعیت نسخه */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-3xl border border-border bg-card p-4">
        <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isPro ? 'bg-primary text-primary-foreground' : 'bg-primary/12'}`}>
          <Crown className="h-6 w-6 text-primary" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-extrabold">{isPro ? 'نسخه پرو فعال است' : 'نسخه رایگان'}</p>
          <p className="text-[11px] text-muted-foreground">
            {isPro ? 'کاربر لایسنس فعال دارد' : 'برای دسترسی به تمامی امکانات، نسخه کامل را فعال کنید.'}
          </p>
        </div>
        <Button size="sm" onClick={() => push({ name: 'pro' })} className="h-9 rounded-xl px-4 text-xs font-bold">
          {isPro ? 'مشاهده' : 'ارتقا به پرو'}
        </Button>
      </motion.section>

      {/* پوسته */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-3xl border border-border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-extrabold">
          <Sun className="h-4 w-4 text-primary" aria-hidden="true" />
          پوسته دیداری (تم برنامه)
        </h3>
        <p className="mt-1 text-[11px] leading-6 text-muted-foreground">
          حالت تیره برای استفاده در شب و کاهش خستگی چشم، و حالت روشن مناسب نور فضای آزاد می‌باشد.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="انتخاب پوسته">
          <button
            role="radio"
            aria-checked={theme === 'dark'}
            onClick={() => setTheme('dark')}
            className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-extrabold transition ${theme === 'dark' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
          >
            <Moon className="h-4 w-4" aria-hidden="true" />
            پوسته تیره
          </button>
          <button
            role="radio"
            aria-checked={theme === 'light'}
            onClick={() => setTheme('light')}
            className={`flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-extrabold transition ${theme === 'light' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
          >
            <Sun className="h-4 w-4" aria-hidden="true" />
            پوسته روشن
          </button>
        </div>
      </motion.section>

      {/* فونت */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-3xl border border-border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-extrabold">
          <Type className="h-4 w-4 text-primary" aria-hidden="true" />
          اندازه قلم متون آموزشی (سایز فونت)
        </h3>
        <p className="mt-1 text-[11px] leading-6 text-muted-foreground">
          اندازه نمایش قلم متون و مباحث هک و امنیت را با توجه به بینایی خود تنظیم کنید.
        </p>
        <div className="mt-3 grid grid-cols-4 gap-2" role="radiogroup" aria-label="اندازه فونت">
          {FONTS.map((f) => (
            <button
              key={f.key}
              role="radio"
              aria-checked={font === f.key}
              onClick={() => setFont(f.key)}
              className={`rounded-2xl py-3 text-xs font-extrabold transition ${font === f.key ? 'bg-primary text-primary-foreground shadow-md' : 'bg-secondary text-muted-foreground hover:text-foreground'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </motion.section>

      {/* بررسی بروزرسانی */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.13 }} className="rounded-3xl border border-border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-extrabold">
          <RefreshCw className={`h-4 w-4 text-primary ${checking ? 'animate-spin' : ''}`} aria-hidden="true" />
          بررسی بروزرسانی
        </h3>
        <p className="mt-1 text-[11px] leading-6 text-muted-foreground">
          نسخه نصب‌شده برنامه با آخرین نسخه منتشرشده در گیت‌هاب مقایسه می‌شود. در صورت وجود نسخه جدید، دریافت و نصب آن
          مستقیماً از داخل برنامه انجام می‌گیرد.
        </p>
        <div className="mt-3 flex items-center gap-2.5">
          <div className="flex-1 rounded-2xl bg-muted/60 p-3 text-[11px] font-bold">
            نسخه نصب‌شده: <span className="text-primary">{data?.version ? faVer(data.version) : faVer(APP_VERSION)}</span>
          </div>
          <Button
            size="sm"
            onClick={handleCheck}
            disabled={checking}
            className="h-11 shrink-0 gap-1.5 rounded-xl px-4 text-xs font-bold"
          >
            {checking ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="h-4 w-4" aria-hidden="true" />}
            {checking ? 'در حال بررسی...' : 'بررسی بروزرسانی'}
          </Button>
        </div>
      </motion.section>

      {/* درباره */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-3xl border border-border bg-card p-4">
        <h3 className="flex items-center gap-2 text-sm font-extrabold">
          <Info className="h-4 w-4 text-primary" aria-hidden="true" />
          درباره برنامه
        </h3>
        <p className="mt-2 text-[11px] leading-7 text-muted-foreground">
          هدف این برنامه افزایش سطح آگاهی سایبری عموم مردم، تامین امنیت شبکه‌های اجتماعی و حفظ حریم خصوصی است. تمامی
          محتواها و کدهای موجود به صورت کاملاً مستقل و ۱۰۰٪ آفلاین توسعه یافته است. محیط امن کامپایل‌شده، مرجع آفلاین
          حریم خصوصی و امنیت.
        </p>
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-2.5 rounded-2xl bg-muted/60 p-3 text-[11px] font-bold">
            <ShieldCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            ۱۰۰٪ آفلاین، بدون نیاز به دسترسی اینترنت
          </div>
          <div className="flex items-center gap-2.5 rounded-2xl bg-muted/60 p-3 text-[11px] font-bold">
            <Smartphone className="h-4 w-4 text-primary" aria-hidden="true" />
            نسخه {data?.version ?? faVer(APP_VERSION)} ({data?.versionName ?? 'سپر امنیتی آفلاین'})
          </div>
          <div className="flex items-center gap-2.5 rounded-2xl bg-muted/60 p-3 text-[11px] font-bold">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
            {data?.lessons.length ?? 20} مبحث جامع • {data?.tools.length ?? 13} ابزار مجهز
          </div>
        </div>
      </motion.section>

      <p className="pb-2 text-center text-[10px] text-muted-foreground">
        اپلیکیشن امنیتی ضد هک (Anti Hack) — ساخته شده با عشق برای امنیت شما
      </p>

      {/* دیالوگ نتیجه بررسی بروزرسانی */}
      <Dialog open={updateOpen} onOpenChange={setUpdateOpen}>
        <DialogContent className="max-w-sm rounded-3xl border-border bg-card p-6" dir="rtl">
          {result && !result.isNewer && (
            <>
              <DialogHeader className="items-start text-right">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/15">
                    <ShieldCheck className="h-6 w-6 text-emerald-600" aria-hidden="true" />
                  </span>
                  <div>
                    <DialogTitle className="text-emerald-600">برنامه بروز است ✓</DialogTitle>
                    <DialogDescription className="text-[11px]">
                      شما جدیدترین نسخه منتشرشده را در اختیار دارید.
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="space-y-1.5 rounded-2xl bg-muted/60 p-3.5 text-[11px]">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">نسخه نصب‌شده روی دستگاه شما</span>
                  <b>{data?.version ? faVer(data.version) : faVer(APP_VERSION)}</b>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">آخرین نسخه منتشرشده در گیت‌هاب</span>
                  <b>{faVer(result.latestVersion)}</b>
                </div>
                {result.title && (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">نام انتشار</span>
                    <b className="text-left">{result.title}</b>
                  </div>
                )}
              </div>
              <Button onClick={() => setUpdateOpen(false)} className="mt-4 w-full rounded-2xl font-bold">
                متوجه شدم
              </Button>
            </>
          )}

          {result && result.isNewer && (
            <>
              <DialogHeader className="items-start text-right">
                <div className="mb-3 flex items-center gap-3">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15">
                    <Sparkles className="h-6 w-6 text-primary" aria-hidden="true" />
                  </span>
                  <div>
                    <DialogTitle className="text-primary">بروزرسانی جدید موجود است!</DialogTitle>
                    <DialogDescription className="text-[11px]">
                      نسخه جدید از گیت‌هاب دریافت و نصب می‌شود
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex items-stretch gap-2.5">
                <div className="flex-1 rounded-2xl bg-muted/60 p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">نسخه نصب‌شده</p>
                  <p className="text-xs font-bold line-through opacity-70">{data?.version ? faVer(data.version) : faVer(APP_VERSION)}</p>
                </div>
                <ChevronLeft className="h-5 w-5 shrink-0 self-center text-muted-foreground" aria-hidden="true" />
                <div className="flex-1 rounded-2xl border-[1.5px] border-primary/45 bg-primary/8 p-2.5 text-center">
                  <p className="text-[10px] text-muted-foreground">نسخه جدید</p>
                  <p className="text-[13px] font-extrabold text-primary">{faVer(result.latestVersion)}</p>
                </div>
              </div>

              {result.changelog && (
                <div className="mt-3">
                  <p className="mb-1.5 text-[11px] font-extrabold">اتفاقی که در این نسخه افتاده:</p>
                  <ChangelogBody md={result.changelog} />
                </div>
              )}

              {result.publishedAt && (
                <p className="mt-2 text-[10px] text-muted-foreground">
                  تاریخ انتشار: {new Date(result.publishedAt).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              )}

              <div className="mt-4 space-y-2">
                <Button onClick={handleDownload} className="h-12 w-full gap-2 rounded-2xl text-sm font-bold">
                  <Download className="h-4 w-4" aria-hidden="true" />
                  دانلود و نصب بروزرسانی
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setUpdateOpen(false)}
                  className="w-full rounded-2xl text-xs font-bold text-muted-foreground"
                >
                  فعلاً نه
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
