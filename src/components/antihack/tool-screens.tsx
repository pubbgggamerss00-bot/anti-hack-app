'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from '@/lib/store'
import { DynIcon } from './icons'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Progress } from '@/components/ui/progress'
import { Crown, Lock, ShieldCheck, ShieldAlert, Play, RotateCcw, Copy, CheckCircle2, AlertTriangle, XCircle, EyeOff, Clock, CalendarDays, Search, ChevronLeft, HardDrive, Bug, UserRound, Layers, BarChart3, PackageX, Wrench, Trash2, Camera, MapPin, CardSim, Users, Mic, Loader2, Info, Lightbulb } from 'lucide-react'
import { toast } from 'sonner'
import { LS } from '@/lib/store'

/* ───────────────── اشتراکی ───────────────── */

function ProGate({ children }: { children: React.ReactNode }) {
  const { isPro, push } = useApp()
  if (isPro) return <>{children}</>
  return (
    <div className="flex flex-col items-center gap-4 rounded-3xl border border-primary/40 bg-card p-8 text-center gold-glow">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/15">
        <Crown className="h-8 w-8 text-primary" aria-hidden="true" />
      </span>
      <h2 className="text-base font-extrabold">این بخش در نسخه حرفه‌ای فعال است</h2>
      <p className="max-w-xs text-xs leading-6 text-muted-foreground">
        با یک‌بار فعالسازی نسخه پرو، به تمامی ۲۰ درس جامع آموزشی ضد هک و ۱۳ ابزار پیشرفته امنیتی دسترسی نامحدود و
        مادام‌العمر پیدا کنید.
      </p>
      <Button onClick={() => push({ name: 'pro' })} className="w-full rounded-2xl py-5 font-extrabold">
        ارتقا و فعالسازی
      </Button>
    </div>
  )
}

type SimApp = {
  packageName: string
  name: string
  installDate: string
  hasLauncherIcon: boolean
  isSystem: boolean
  isGooglePackage: boolean
  permissions: string[]
  isDeviceAdmin: boolean
  isAccessibility: boolean
  isOverlay: boolean
  isUsageAccess: boolean
  isSuspicious: boolean
  signatureOk: boolean
  sizeMb: number
}

const faDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' })

const PERM_META: Record<string, { label: string; icon: string }> = {
  sms: { label: 'پیامک', icon: 'CardSim' },
  gps: { label: 'مکان (GPS)', icon: 'MapPin' },
  camera: { label: 'دوربین', icon: 'Camera' },
  contacts: { label: 'مخاطبین', icon: 'Users' },
  mic: { label: 'میکروفون', icon: 'Mic' },
}

function AppRow({ app, badge }: { app: SimApp; badge?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-base font-extrabold ${
          app.isSuspicious ? 'bg-destructive/15 text-destructive' : app.isGooglePackage ? 'bg-primary/15 text-primary' : 'bg-secondary text-foreground/70'
        }`}
      >
        {app.name.slice(0, 2)}
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-[13px] font-bold">
          {app.name}
          {app.isSuspicious && <Bug className="h-3.5 w-3.5 shrink-0 text-destructive" aria-hidden="true" />}
          {app.isGooglePackage && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" aria-hidden="true" />}
        </p>
        <p className="truncate text-[10px] text-muted-foreground" dir="ltr">
          {app.packageName}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {app.isSystem && <span className="rounded-md bg-muted px-1.5 py-0.5 text-[9px]">سیستمی</span>}
          {!app.signatureOk && (
            <span className="rounded-md bg-destructive/15 px-1.5 py-0.5 text-[9px] font-bold text-destructive">
              امضای مشکوک
            </span>
          )}
          {!app.hasLauncherIcon && !app.isSystem && (
            <span className="rounded-md bg-destructive/15 px-1.5 py-0.5 text-[9px] font-bold text-destructive">بدون آیکون</span>
          )}
          <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
            <HardDrive className="h-3 w-3" aria-hidden="true" />
            {app.sizeMb} مگابایت
          </span>
        </div>
      </div>
      {badge}
    </div>
  )
}

function ScanIntro({ title, desc, cta, onScan, scanning, found }: { title: string; desc: string; cta: string; onScan: () => void; scanning: boolean; found: number | null }) {
  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-border bg-card p-5 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/12">
          <Wrench className="h-8 w-8 text-primary" aria-hidden="true" />
        </span>
        <h2 className="mt-3 text-sm font-extrabold">{title}</h2>
        <p className="mt-1.5 text-[11px] leading-6 text-muted-foreground">{desc}</p>
        <Button onClick={onScan} disabled={scanning} className="mt-4 w-full rounded-2xl py-5 font-extrabold" >
          {scanning ? <Loader2 className="ml-1 h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="ml-1 h-4 w-4" aria-hidden="true" />}
          {scanning ? 'در حال اسکن عمیق...' : found === null ? cta : 'تکرار مجدد اسکن'}
        </Button>
      </div>
      {scanning && (
        <div className="relative overflow-hidden rounded-2xl border border-primary/40 bg-card p-4">
          <div className="scan-line absolute inset-x-0 h-10 bg-gradient-to-b from-transparent via-primary/10 to-transparent" aria-hidden="true" />
          <p className="relative text-center text-xs font-bold text-primary">در حال واکاوی لایه‌های سیستمی و بسته‌های فاقد پرتابگر...</p>
        </div>
      )}
    </div>
  )
}

/* ───────────────── ۱) سپر طلایی ───────────────── */

type ScanStep = { id: string; label: string; status: string; statusLabel: string }
type Finding = {
  id: string
  severity: 'critical' | 'high' | 'medium' | 'low'
  title: string
  detail: string
  fixable: boolean
  fixAction?: string
}

export function GoldenShieldTool() {
  const [scanning, setScanning] = useState(false)
  const [steps, setSteps] = useState<ScanStep[]>([])
  const [phase, setPhase] = useState(0)
  const [result, setResult] = useState<{ score: number; issues: Finding[]; message: string } | null>(null)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  const runScan = useCallback(async () => {
    setScanning(true)
    setSteps([])
    setPhase(0)
    setResult(null)
    timers.current.forEach(clearTimeout)
    timers.current = []

    const totalSteps = 9
    const collected: ScanStep[] = []
    for (let i = 0; i < totalSteps; i++) {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: i }),
      })
      const json = await res.json()
      if (json.ok && json.step) {
        collected.push(json.step)
        setSteps([...collected])
        setPhase(i + 1)
      }
      await new Promise((r) => setTimeout(r, 420 + Math.random() * 380))
    }

    const res = await fetch('/api/scan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' })
    const json = await res.json()
    if (json.ok) {
      setResult({ score: json.score, issues: json.issues, message: json.message })
      useApp.setState((s) => ({ data: s.data ? { ...s.data, lastScanScore: json.score } : s.data }))
    }
    setScanning(false)
  }, [])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const fix = async (action: string, issueId: string) => {
    const res = await fetch('/api/scan/fix', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action }),
    })
    const json = await res.json()
    if (json.ok) {
      toast.success(json.message)
      setResult((prev) => (prev ? { ...prev, issues: prev.issues.filter((i) => i.id !== issueId) } : prev))
    } else {
      toast.error(json.error ?? 'خطا در رفع مشکل')
    }
  }

  const sevMeta: Record<string, { color: string; label: string }> = {
    critical: { color: 'bg-destructive/12 border-destructive/40', label: 'بحرانی' },
    high: { color: 'bg-destructive/8 border-destructive/30', label: 'خطر' },
    medium: { color: 'bg-amber-500/10 border-amber-500/35', label: 'متوسط' },
    low: { color: 'bg-muted border-border', label: 'کم' },
  }

  const gaugeColor = !result ? '#71717a' : result.score >= 90 ? '#10b981' : result.score >= 70 ? '#f0b429' : '#ef4444'

  return (
    <div className="space-y-3.5">
      <div className="rounded-3xl border border-primary/40 bg-card p-5 text-center gold-glow">
        <div className="relative mx-auto flex h-32 w-32 items-center justify-center">
          <svg viewBox="0 0 120 120" className="h-32 w-32 -rotate-90">
            <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" className="text-muted" strokeWidth="10" />
            {result && (
              <motion.circle
                cx="60"
                cy="60"
                r="52"
                fill="none"
                stroke={gaugeColor}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 52}
                initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - result.score / 100) }}
                transition={{ duration: 1.1, ease: 'easeOut' }}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold" aria-live="polite">
              {result ? `${result.score}٪` : scanning ? '...' : '—'}
            </span>
            <span className="text-[10px] text-muted-foreground">امتیاز سلامت</span>
          </div>
        </div>
        <h2 className="mt-2 text-sm font-extrabold">سپر طلایی: اسکن زنده و پشتچر امنیتی گوشی</h2>
        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
          بررسی چندوجهی و یکجای امنیت کل سیستم‌عامل شامل وضعیت روت، اشکال‌زدایی USB و لوکیشن‌های مجازی — این آزمون
          ۱۰۰٪ محلی بوده و هیچ داده‌ای از تلفن شما خارج نخواهد شد.
        </p>
        <Button onClick={runScan} disabled={scanning} className="mt-4 w-full rounded-2xl bg-primary py-5 font-extrabold text-primary-foreground hover:brightness-110">
          {scanning ? <Loader2 className="ml-1 h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="ml-1 h-4 w-4" aria-hidden="true" />}
          {scanning ? 'در حال اسکن عمیق...' : result ? 'تکرار مجدد اسکن' : 'شروع اسکن کامل سپر طلایی'}
        </Button>
      </div>

      {/* مراحل اسکن */}
      {(scanning || steps.length > 0) && (
        <section className="rounded-3xl border border-border bg-card p-4" aria-label="مراحل اسکن">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-[13px] font-extrabold">مراحل ممیزی زنده</h3>
            <span className="text-[11px] text-muted-foreground">
              مرحله {phase} از ۹
            </span>
          </div>
          <Progress value={(phase / 9) * 100} className="mb-3 h-1.5" />
          <ul className="space-y-1.5">
            {steps.map((s) => (
              <motion.li key={s.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between gap-2 rounded-xl bg-muted/60 px-3 py-2">
                <span className="min-w-0 truncate text-[11px] leading-5">{s.label}</span>
                <span className={`shrink-0 rounded-lg px-2 py-0.5 text-[10px] font-bold ${
                  s.status === 'danger' ? 'bg-destructive/15 text-destructive' : s.status === 'warn' ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/12 text-emerald-600 dark:text-emerald-400'
                }`}>
                  {s.statusLabel}
                </span>
              </motion.li>
            ))}
            {scanning && (
              <li className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2 text-[11px] font-bold text-primary">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                در حال اسکن عمیق... مرحله {phase + 1}
              </li>
            )}
          </ul>
        </section>
      )}

      {/* نتیجه */}
      {result && (
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2.5">
          <div className={`rounded-2xl border p-4 text-center text-[13px] font-bold ${result.score >= 90 ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : result.score >= 70 ? 'border-primary/40 bg-primary/10 text-primary' : 'border-destructive/40 bg-destructive/10 text-destructive'}`}>
            نتیجه‌گیری و جمع‌بندی نهایی: {result.message}
          </div>

          {result.issues.length === 0 ? (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" aria-hidden="true" />
              <p className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400">هیچ مشکل امنیتی فعالی یافت نشد — عالی!</p>
            </div>
          ) : (
            <div className="space-y-2">
              <h3 className="px-1 text-[13px] font-extrabold">بررسی و پایش امنیتی — {result.issues.length} مورد</h3>
              {result.issues.map((issue) => (
                <motion.div key={issue.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`rounded-2xl border p-3.5 ${sevMeta[issue.severity].color}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="flex flex-wrap items-center gap-1.5 text-[12.5px] font-extrabold">
                        <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
                        {issue.title}
                        <span className="rounded-md bg-black/10 px-1.5 py-0.5 text-[9px] dark:bg-white/10">{sevMeta[issue.severity].label}</span>
                      </p>
                      <p className="mt-1 text-[11px] leading-6 text-foreground/80">{issue.detail}</p>
                    </div>
                    {issue.fixable && issue.fixAction && (
                      <Button size="sm" onClick={() => fix(issue.fixAction!, issue.id)} className="h-8 shrink-0 rounded-xl px-3 text-[11px] font-bold">
                        رفع مشکل
                      </Button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          <div className="rounded-2xl bg-muted/60 p-3.5 text-[11px] leading-6 text-muted-foreground">
            <Info className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" /> پیشنهاد طلایی سیستم: پس از رفع هر مورد، دکمه
            «تکرار مجدد اسکن» را بزنید تا امتیاز مصونیت دفاعی به‌روز شود. خاموش کردن کیلاگرها، شنودکننده‌های صوتی و
            برنامه‌های جاسوسی فعال شده از اهداف اصلی این سپر است.
          </div>
        </motion.section>
      )}
    </div>
  )
}

/* ───────────────── ۲) مخفی‌یاب برنامه‌ها ───────────────── */

export function HiddenAppsTool() {
  const { isPro } = useApp()
  const [scanning, setScanning] = useState(false)
  const [apps, setApps] = useState<SimApp[] | null>(null)

  const scan = async () => {
    setScanning(true)
    setApps(null)
    await new Promise((r) => setTimeout(r, 1500))
    const res = await fetch('/api/apps?filter=hidden')
    const json = await res.json()
    if (json.ok) setApps(json.apps)
    setScanning(false)
  }

  return (
    <div className="space-y-3">
      <ScanIntro
        title="مخفی‌یاب برنامه‌ها (اسکنر)"
        desc="بسیاری از تروجان‌های تبلیغاتی یا جاسوس‌افزارها آیکون اجرای خود را در منوی اصلی مخفی می‌کنند تا شما نتوانید آن‌ها را ببینید. این اسکنر برنامه‌های نصب‌شده توسط کاربر که فاقد آیکون شلیک‌کننده (پرتابگر) هستند را فهرست می‌کند."
        cta="شروع اسکن دسترسی‌های بحرانی"
        onScan={scan}
        scanning={scanning}
        found={apps === null ? null : apps.length}
      />
      {apps && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <div className={`rounded-2xl border p-4 text-center text-[13px] font-extrabold ${apps.length > 0 ? 'border-destructive/40 bg-destructive/10 text-destructive' : 'border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
            {apps.length > 0
              ? `برنامه‌های پنهان بدون آیکون یافت‌شده (${apps.length}) — به احتمال زیاد جاسوس‌افزار هستند!`
              : 'هیچ برنامه مخفی بدون آیکونی یافت نشد — دستگاه پاکیزه است.'}
          </div>
          {apps.map((a) => (
            <AppRow key={a.packageName} app={a} badge={
              <span className="flex shrink-0 items-center gap-1 rounded-xl bg-destructive/15 px-2.5 py-1.5 text-[10px] font-bold text-destructive">
                <EyeOff className="h-3.5 w-3.5" aria-hidden="true" /> پنهان
              </span>
            } />
          ))}
          {apps.length > 0 && (
            <div className="rounded-2xl bg-muted/60 p-3.5 text-[11px] leading-6 text-muted-foreground">
              پیشنهاد: اگر این برنامه‌ها را نشناختید، بلافاصله حذف نصب کنید و پس از آن، رمز عبور حساب‌های اصلی خود را تغییر دهید.
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}

/* ───────────────── ۳) برنامه‌های تازه نصب شده ───────────────── */

export function RecentAppsTool() {
  const [apps, setApps] = useState<SimApp[] | null>(null)
  const [scanning, setScanning] = useState(false)

  const scan = async () => {
    setScanning(true)
    setApps(null)
    await new Promise((r) => setTimeout(r, 1300))
    const res = await fetch('/api/apps?filter=recent')
    const json = await res.json()
    if (json.ok) setApps(json.apps)
    setScanning(false)
  }

  return (
    <div className="space-y-3">
      <ScanIntro
        title="برنامه‌های تازه نصب شده"
        desc="بسیاری از بدافزارها بلافاصله پس از نصب پنهان می‌شوند. در این ابزار می‌توانید برنامه‌هایی را که جدیداً روی گوشی ریخته شده‌اند، بر اساس زمان نصب به صورت نزولی ببینید تا اپ جدید مخرب را فوراً شناسایی کنید."
        cta="شروع اسکن برنامه‌های تازه"
        onScan={scan}
        scanning={scanning}
        found={apps === null ? null : apps.length}
      />
      {apps && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <p className="rounded-2xl bg-muted/60 p-3 text-[11px] leading-6 text-muted-foreground">
            در لیست زیر برنامه‌ها بر اساس جدیدترین زمان نصب چیده شده‌اند تا بدافزارهای جاسوسی تازه نصب شده را پایش کنید.
          </p>
          {apps.map((a) => (
            <AppRow key={a.packageName} app={a} badge={
              <span className="flex shrink-0 flex-col items-start gap-0.5">
                <span className="flex items-center gap-1 rounded-lg bg-muted px-2 py-1 text-[9px] text-muted-foreground">
                  <CalendarDays className="h-3 w-3" aria-hidden="true" />
                  تاریخ نصب: {faDate(a.installDate)}
                </span>
                {a.isSuspicious && (
                  <span className="rounded-lg bg-destructive/15 px-2 py-1 text-[9px] font-bold text-destructive">مشکوک</span>
                )}
              </span>
            } />
          ))}
        </motion.div>
      )}
    </div>
  )
}

/* ───────────────── ۴) کاوشگر دسترسی‌های حساس ───────────────── */

const PERM_TABS = ['sms', 'gps', 'camera', 'contacts', 'mic'] as const

export function SensitivePermissionsTool() {
  const [tab, setTab] = useState<(typeof PERM_TABS)[number]>('sms')
  const [apps, setApps] = useState<SimApp[] | null>(null)
  const [scanning, setScanning] = useState(false)

  const loadPerm = useCallback(async (perm: string) => {
    setApps(null)
    const res = await fetch(`/api/apps?filter=permissions&perm=${perm}`)
    const json = await res.json()
    if (json.ok) setApps(json.apps)
  }, [])

  const scan = async () => {
    setScanning(true)
    await new Promise((r) => setTimeout(r, 1200))
    setScanning(false)
    loadPerm('sms')
  }

  const selectTab = (p: (typeof PERM_TABS)[number]) => {
    setTab(p)
    loadPerm(p)
  }

  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-border bg-card p-5">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/12">
          <Search className="h-7 w-7 text-primary" aria-hidden="true" />
        </span>
        <h2 className="mt-3 text-center text-sm font-extrabold">کاوشگر دسترسی‌های حساس برنامه‌ها</h2>
        <p className="mt-1.5 text-center text-[11px] leading-6 text-muted-foreground">
          بررسی اینکه چه تعداد برنامه در حال حاضر به پیامک‌های شما، اطلاعات مکانی زنده، دوربین و مخاطبان دسترسی تام
          دارند. با لمس هر ردیف، برنامه‌ها را مشاهده و لغو دسترسی کنید.
        </p>
        <Button onClick={scan} disabled={scanning} className="mt-4 w-full rounded-2xl py-5 font-extrabold">
          {scanning ? <Loader2 className="ml-1 h-4 w-4 animate-spin" aria-hidden="true" /> : <Play className="ml-1 h-4 w-4" aria-hidden="true" />}
          {scanning ? 'در حال اسکن عمیق...' : 'شروع اسکن دسترسی‌های بحرانی'}
        </Button>
      </div>

      {apps !== null && (
        <>
          <div className="flex gap-1.5 overflow-x-auto pb-1" role="tablist" aria-label="نوع دسترسی">
            {PERM_TABS.map((p) => (
              <button
                key={p}
                role="tab"
                aria-selected={tab === p}
                onClick={() => selectTab(p)}
                className={`flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-bold transition ${
                  tab === p ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                <DynIcon name={PERM_META[p].icon} className="h-3.5 w-3.5" />
                {PERM_META[p].label}
              </button>
            ))}
          </div>
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
            {apps.length === 0 ? (
              <p className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
                هیچ برنامه‌ای دسترسی {PERM_META[tab].label} ندارد — عالی!
              </p>
            ) : (
              <>
                <p className="rounded-2xl bg-muted/60 p-3 text-[11px] leading-6 text-muted-foreground">
                  {apps.length} برنامه به {PERM_META[tab].label} دسترسی دارد. دسترسی‌های حساس نظیر خواندن پیامک، ردیابی
                  زنده مکان، دوربین و ضبط صدا نباید به برنامه‌های پیش‌پا افتاده داده شود.
                </p>
                {apps.map((a) => (
                  <AppRow key={a.packageName} app={a} />
                ))}
              </>
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}

/* ─────────── ۵،۶،۷،۸) ابزارهای دسترسی خاص (الگوی مشترک) ─────────── */

type SpecialToolConfig = {
  key: string
  title: string
  desc: string
  icon: string
  filter: string
  warnTitle: string
  warn: string
  extra: string
}

const SPECIAL_CONFIGS: Record<string, SpecialToolConfig> = {
  'device-admin': {
    key: 'device-admin',
    title: 'بررسی برنامه‌های مدیر دستگاه',
    desc: 'شناسایی برنامه‌هایی که مجوزهای مدیریتی کامل (Device Administrator) دارند',
    icon: 'Crown',
    filter: 'admin',
    warnTitle: 'هشدار جدی حریم خصوصی:',
    warn: 'برنامه‌های دارای مجوز Device Admin می‌توانند به‌طور کامل قفل صفحه را تغییر دهند، داده‌ها را پاک کنند یا مانع از حذف نصب خود شوند. بدافزارهای جاسوسی پیشرفته اغلب این دسترسی را به روش فریبکارانه فعال می‌کنند تا از حذف خود جلوگیری نمایند.',
    extra: 'به جز برنامه‌های شناخته‌شده سیستمی (مانند یافتن دستگاه من یا برنامه‌های امنیتی معتبر گوگل)، دسترسی بقیه را بلافاصله لغو کنید. مدیریت دسترسی ادمین در تنظیمات گوشی: Security -> Device admin apps',
  },
  accessibility: {
    key: 'accessibility',
    title: 'پایشگر دسترسی دستیار صوتی و حرکتی (Accessibility)',
    desc: 'اسکن زنده Accessibility Service فعال‌شده مزاحم',
    icon: 'PersonStanding',
    filter: 'accessibility',
    warnTitle: 'هشدار بسیار حیاتی:',
    warn: 'قابلیت دسترسی (Accessibility) خطرناک‌ترین مجوز اندروید است! برنامه‌ای که این دسترسی را دارد می‌تواند محتوای تمام صفحه‌ها (شامل رمزهای عبور، تلگرام، واتساپ) را بخواند، کلیک‌های شما را ثبت کند و مخفیانه کارهای دیگر انجام دهد.',
    extra: 'هیچگاه به برنامه‌ای که به آن ایمان ۱۰۰٪ ندارید اجازه دسترسی راحت تسهیلات را صادر نکنید. تنها به ابزارهای موردنیاز واقعی خود نظیر نقشه‌ها یا دستیارها این دسترسی را ارائه دهید.',
  },
  overlay: {
    key: 'overlay',
    title: 'بررسی برنامه‌های دارای Overlay',
    desc: 'ردیابی برنامه‌هایی که توانایی ترسیم روی صفحه نمایشگر (Draw over other apps) دارند',
    icon: 'Layers',
    filter: 'overlay',
    warnTitle: 'نشانگان خطر فیشینگ لایه‌ای:',
    warn: 'قابلیت اورلی یا ترسیم روی سایر صفحات توسط برنامه‌های مخرب برای شبیه‌سازی درگاه‌های بانکی روی درگاه واقعی به کار می‌رود تا با لمس شما، اطلاعات کارت و رمزها را بربایند.',
    extra: 'بستن کامل یا مسدودسازی برنامه‌های حباب شناور نامعلوم (Overlay) از تنظیمات: Special app access -> Display over other apps',
  },
  'usage-stats': {
    key: 'usage-stats',
    title: 'بررسی دسترسی آمار استفاده (Usage Stats)',
    desc: 'پایش اپلیکیشن‌هایی که آمار زمان استفاده شما از سایر برنامه‌ها را جمع‌آوری می‌کنند',
    icon: 'BarChart3',
    filter: 'usage',
    warnTitle: 'نقض حریم خصوصی:',
    warn: 'دسترسی به آمار استفاده (Usage Statistics)، به برنامه‌ها اجازه می‌دهد زمان باز و بسته شدن تک‌تک اپلیکیشن‌های گوشی شما را ثبت کنند که نقض حریم خصوصی است.',
    extra: 'برنامه‌های مانیتورینگ والدین و نرم‌افزارهای تجسس شرکتی به‌طور فشرده از این قابلیت استفاده می‌کنند تا کاربر را زیر نظر بگیرند. ویرایش مجوز دسترسی به داده کاربری: Special app access -> Usage access',
  },
}

function SpecialAccessTool({ config }: { config: SpecialToolConfig }) {
  const [scanning, setScanning] = useState(false)
  const [apps, setApps] = useState<SimApp[] | null>(null)

  const scan = async () => {
    setScanning(true)
    setApps(null)
    await new Promise((r) => setTimeout(r, 1400))
    const res = await fetch(`/api/apps?filter=${config.filter}`)
    const json = await res.json()
    if (json.ok) setApps(json.apps)
    setScanning(false)
  }

  return (
    <div className="space-y-3">
      <ScanIntro
        title={config.title}
        desc={config.desc + ' — ' + config.warn}
        cta="شروع اسکن دسترسی‌های بحرانی"
        onScan={scan}
        scanning={scanning}
        found={apps === null ? null : apps.length}
      />
      {apps && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          {apps.length === 0 ? (
            <p className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-center text-[12px] font-bold text-emerald-600 dark:text-emerald-400">
              هیچ برنامه فعالی در این بخش یافت نشد — دستگاه شما پاکیزه است!
            </p>
          ) : (
            apps.map((a) => <AppRow key={a.packageName} app={a} />)
          )}
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-3.5 text-[11px] leading-6">
            <p className="font-extrabold text-primary">{config.warnTitle}</p>
            <p className="mt-1 text-foreground/80">{config.extra}</p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

/* ───────────────── ۹) تولید رمز عبور قوی ───────────────── */

const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const LOWER = 'abcdefghijkmnopqrstuvwxyz'
const DIGITS = '23456789'
const SYMBOLS = '!@#$%^&*_+-=?'

function generatePassword(length: number, useUpper: boolean, useDigits: boolean, useSymbols: boolean) {
  let pool = LOWER
  const guaranteed: string[] = [LOWER[Math.floor(Math.random() * LOWER.length)]]
  if (useUpper) {
    pool += UPPER
    guaranteed.push(UPPER[Math.floor(Math.random() * UPPER.length)])
  }
  if (useDigits) {
    pool += DIGITS
    guaranteed.push(DIGITS[Math.floor(Math.random() * DIGITS.length)])
  }
  if (useSymbols) {
    pool += SYMBOLS
    guaranteed.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
  }
  const rest = length - guaranteed.length
  const arr = Array.from({ length: Math.max(0, rest) }, () => pool[Math.floor(Math.random() * pool.length)])
  const all = [...guaranteed, ...arr]
  // بهم‌زدن
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[all[i], all[j]] = [all[j], all[i]]
  }
  return all.join('')
}

function crackTimeText(seconds: number): string {
  if (seconds < 1) return 'کمتر از ۱ ثانیه'
  if (seconds < 60) return `${Math.round(seconds)} ثانیه`
  if (seconds < 3600) return `${Math.round(seconds / 60)} دقیقه`
  if (seconds < 86400) return `${Math.round(seconds / 3600)} ساعت`
  if (seconds < 2592000) return `${Math.round(seconds / 86400)} روز`
  if (seconds < 31536000) return `${Math.round(seconds / 2592000)} ماه`
  const years = seconds / 31536000
  const faNum = (n: number) => Math.round(n).toLocaleString('fa-IR')
  if (years > 1e12) return `بیش از ${(years / 1e12).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} تریلیون سال`
  if (years > 1e9) return `${(years / 1e9).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} میلیارد سال`
  if (years > 1e6) return `${(years / 1e6).toLocaleString('fa-IR', { maximumFractionDigits: 1 })} میلیون سال`
  return `${faNum(years)} سال`
}

export function PasswordGeneratorTool() {
  const [length, setLength] = useState(16)
  const [upper, setUpper] = useState(true)
  const [digits, setDigits] = useState(true)
  const [symbols, setSymbols] = useState(true)
  const [pw, setPw] = useState(() => generatePassword(16, true, true, true))
  const [copied, setCopied] = useState(false)

  const gen = useCallback(() => {
    setPw(generatePassword(length, upper, digits, symbols))
    setCopied(false)
  }, [length, upper, digits, symbols])

  const poolSize = 26 + (upper ? 24 : 0) + (digits ? 8 : 0) + (symbols ? 13 : 0)
  const entropy = length * Math.log2(poolSize || 26)
  const seconds = Math.pow(2, entropy) / 1e10 // 10 میلیارد حدس در ثانیه

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pw)
      setCopied(true)
      toast.success('رمز عبور با موفقیت کپی شد!')
    } catch {
      toast.error('کپی ناموفق بود')
    }
  }

  const strength = entropy < 40 ? { label: 'خیلی ضعیف', cls: 'text-destructive bg-destructive' } : entropy < 60 ? { label: 'متوسط', cls: 'text-amber-500 bg-amber-500' } : entropy < 80 ? { label: 'قوی', cls: 'text-emerald-500 bg-emerald-500' } : { label: 'فوق‌العاده قوی', cls: 'text-emerald-600 bg-emerald-600' }

  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-center text-sm font-extrabold">ساخت رمز عبور قوی</h2>
        <p className="mt-1 text-center text-[11px] leading-6 text-muted-foreground">
          تولید پسوردهای تصادفی بسیار پیچیده و ایمن بر اساس طول و کاراکترهای دلخواه شما — اصول ریاضی و تجربی در
          طراحی پسوردهایی که زاییده ذهن هکرها و کامپیوترها نیست.
        </p>

        {/* نمایش رمز */}
        <div dir="ltr" className="mt-4 flex items-center gap-2 rounded-2xl border border-primary/40 bg-navy p-4">
          <code className="min-w-0 flex-1 break-all text-center font-mono text-sm font-bold text-primary sm:text-base">
            {pw}
          </code>
          <button
            onClick={copy}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 transition hover:bg-white/20"
            aria-label="کپی رمز عبور"
          >
            {copied ? <CheckCircle2 className="h-5 w-5 text-emerald-400" aria-hidden="true" /> : <Copy className="h-5 w-5 text-white" aria-hidden="true" />}
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px]">
          <span className="text-muted-foreground">قدرت تخمینی:</span>
          <span className="flex items-center gap-2">
            <span className={`font-extrabold ${strength.cls.split(' ')[0]}`}>{strength.label}</span>
            <span className={`h-2 w-2 rounded-full ${strength.cls}`} />
          </span>
        </div>
        <p className="mt-1 text-[10px] text-muted-foreground">
          زمان لازم برای کشف رمز توسط کامپیوتر هکر: <span className="font-bold text-foreground">{crackTimeText(seconds)}</span>
        </p>

        {/* کنترل‌ها */}
        <div className="mt-5 space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between text-xs font-bold">
              <span>طول رمز عبور:</span>
              <span className="rounded-lg bg-primary/15 px-2.5 py-1 text-primary">{length} کاراکتر</span>
            </div>
            <Slider value={[length]} min={8} max={40} step={1} onValueChange={(v) => setLength(v[0])} aria-label="طول رمز عبور" />
          </div>

          <div className="space-y-2.5">
            <label className="flex items-center gap-2.5 text-xs font-bold">
              <Checkbox checked={upper} onCheckedChange={(v) => setUpper(!!v)} />
              شامل حروف بزرگ انگلیسی (A-Z)
            </label>
            <label className="flex items-center gap-2.5 text-xs font-bold">
              <Checkbox checked={digits} onCheckedChange={(v) => setDigits(!!v)} />
              شامل اعداد ریاضی (0-9)
            </label>
            <label className="flex items-center gap-2.5 text-xs font-bold">
              <Checkbox checked={symbols} onCheckedChange={(v) => setSymbols(!!v)} />
              شامل نشانه‌های ویژه (!@#$)
            </label>
          </div>

          <div className="flex gap-2">
            <Button onClick={gen} className="flex-1 rounded-2xl bg-primary py-5 font-extrabold text-primary-foreground hover:brightness-110">
              <RotateCcw className="ml-1 h-4 w-4" aria-hidden="true" />
              تولید مجدد
            </Button>
            <Button onClick={copy} variant="secondary" className="rounded-2xl px-4 py-5 font-bold">
              کپی رمز عبور
            </Button>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-muted/60 p-3.5 text-[11px] leading-6 text-muted-foreground">
        <Info className="ml-1 inline h-3.5 w-3.5" aria-hidden="true" /> این ابزار به صورت کاملاً آفلاین و تصادفی عمل
        می‌کند؛ هیچ رمزی ذخیره یا منتقل نمی‌شود. یک رمز فولادین حداقل باید دارای ۱۲ کاراکتر ترکیبی باشد.
      </div>
    </div>
  )
}

/* ───────────────── ۱۰) تخمین قدرت رمز عبور ───────────────── */

function analyzePassword(pw: string) {
  if (!pw) return null
  let pool = 0
  if (/[a-z]/.test(pw)) pool += 26
  if (/[A-Z]/.test(pw)) pool += 26
  if (/[0-9]/.test(pw)) pool += 10
  if (/[^a-zA-Z0-9]/.test(pw)) pool += 33
  const entropy = pw.length * Math.log2(pool || 1)
  const seconds = Math.pow(2, entropy) / 1e10

  const commonPatterns = [
    { re: /^(123456|password|111111|000000|admin|qwerty|abc123|iloveyou)/i, msg: 'شروع با الگوی فوق‌متداول هک‌شده' },
    { re: /^(ali|mohammad|reza|hossein|mehdi|sara|zahra|fatemeh)/i, msg: 'شروع با اسم‌های رایج فارسی' },
    { re: /13[0-9]{2}$|1[3-9][0-9]{2}$/, msg: 'پایان با سال تولد شمسی' },
    { re: /(0123|1234|5678|abcd|aaaa|bbbb)/i, msg: 'توالی منطقی قابل حدس' },
    { re: /(^[a-z]+$|^[A-Z]+$|^[0-9]+$)/, msg: 'فقط یک نوع کاراکتر استفاده شده' },
    { re: /(^.{1,6}$)/, msg: 'طول رمز بسیار کوتاه است (زیر ۷ کاراکتر)' },
  ]
  const hits = commonPatterns.filter((p) => p.re.test(pw)).map((p) => p.msg)

  const suggestions: string[] = []
  if (pw.length < 12) suggestions.push('طول رمز را به ۱۲ کاراکتر یا بیشتر افزایش دهید')
  if (!/[A-Z]/.test(pw)) suggestions.push('حرف بزرگ انگلیسی اضافه کنید')
  if (!/[0-9]/.test(pw)) suggestions.push('عدد اضافه کنید')
  if (!/[^a-zA-Z0-9]/.test(pw)) suggestions.push('کاراکترهای خاص (!, @, #) اضافه کنید')

  let level: 0 | 1 | 2 | 3 | 4 = 0
  if (entropy >= 100 && hits.length === 0) level = 4
  else if (entropy >= 75 && hits.length <= 1) level = 3
  else if (entropy >= 55) level = 2
  else if (entropy >= 35) level = 1

  const levels = [
    { label: 'خیلی ضعیف', color: 'text-destructive', bar: 'bg-destructive', pct: 15 },
    { label: 'ضعیف', color: 'text-orange-500', bar: 'bg-orange-500', pct: 32 },
    { label: 'متوسط', color: 'text-amber-500', bar: 'bg-amber-500', pct: 55 },
    { label: 'قوی', color: 'text-emerald-500', bar: 'bg-emerald-500', pct: 78 },
    { label: 'فوق‌العاده قوی (فولادین)', color: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-600', pct: 100 },
  ]
  const msgs = [
    'این رمز عبور در چند ثانیه توسط ابزارهای هکری شکسته می‌شود. سریعاً آن را ارتقا دهید.',
    'ضعیف است. سعی کنید کاراکترهای خاص (!, @, #) یا حرف بزرگ انگلیسی اضافه کنید.',
    'شرایط خوبی دارد، ولی اضافه کردن طول رمز می‌تواند آن را بسیار نفوذناپذیرتر کند.',
    'قدرت رمز شما عالی است؛ با افزایش چند کاراکتر به سطح فولادین می‌رسد.',
    'فولادین! زمان تخمینی برای کشف این رمز عبور توسط مقتدرترین کامپیوترها خارق‌العاده است.',
  ]

  return { entropy, seconds, hits, suggestions, level, ...levels[level], msg: msgs[level] }
}

export function PasswordStrengthTool() {
  const [pw, setPw] = useState('')
  const a = useMemo(() => analyzePassword(pw), [pw])

  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-border bg-card p-5">
        <h2 className="text-center text-sm font-extrabold">تخمین قدرت رمز عبور</h2>
        <p className="mt-1 text-center text-[11px] leading-6 text-muted-foreground">
          پسورد دلخواه خود را در این ابزار وارد کنید تا سیستم به صورت دقیق قدرت آن را تخمین بزند. همچنین بررسی می‌کند
          که آیا فرمول‌های هکری به راحتی آن را کشف می‌کنند یا خیر — ۱۰۰٪ محلی و آفلاین.
        </p>

        <div className="relative mt-4">
          <Input
            type="text"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="رمز عبور خود را این‌جا تایپ کنید..."
            dir="ltr"
            className="h-12 rounded-2xl bg-background pr-4 text-left font-mono"
            aria-label="رمز عبور برای تحلیل"
          />
        </div>

        {a && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-3">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground">قدرت تخمینی:</span>
                <span className={`font-extrabold ${a.color}`}>{a.label}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                <motion.div initial={{ width: 0 }} animate={{ width: `${a.pct}%` }} className={`h-full rounded-full ${a.bar}`} />
              </div>
            </div>

            <p className={`rounded-2xl p-3.5 text-[12px] font-bold leading-6 ${a.level <= 1 ? 'bg-destructive/10 text-destructive' : a.level === 2 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
              {a.msg}
            </p>

            <div className="rounded-2xl bg-muted/60 p-3.5 text-[11px] leading-6">
              <p className="font-bold">زمان لازم برای کشف رمز توسط کامپیوتر هکر:</p>
              <p className="mt-1 text-base font-extrabold text-primary">{crackTimeText(a.seconds)}</p>
              <p className="mt-1 text-muted-foreground">آنتروپی محاسبه‌شده: {Math.round(a.entropy)} بیت</p>
            </div>

            {a.hits.length > 0 && (
              <div className="rounded-2xl border border-destructive/35 bg-destructive/8 p-3.5">
                <p className="flex items-center gap-1.5 text-[12px] font-extrabold text-destructive">
                  <XCircle className="h-4 w-4" aria-hidden="true" /> الگوهای کشف‌شده توسط فرمول‌های هکری:
                </p>
                <ul className="mt-1.5 space-y-1 text-[11px] leading-6 text-foreground/85">
                  {a.hits.map((h) => (
                    <li key={h}>• {h}</li>
                  ))}
                </ul>
              </div>
            )}

            {a.suggestions.length > 0 && (
              <div className="rounded-2xl border border-primary/35 bg-primary/8 p-3.5">
                <p className="flex items-center gap-1.5 text-[12px] font-extrabold text-primary">
                  <Lightbulb className="h-4 w-4" aria-hidden="true" /> پیشنهاد طلایی سیستم:
                </p>
                <ul className="mt-1.5 space-y-1 text-[11px] leading-6 text-foreground/85">
                  {a.suggestions.map((s) => (
                    <li key={s}>• {s}</li>
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <div className="rounded-2xl bg-muted/60 p-3.5 text-[11px] leading-6 text-muted-foreground">
        انتخاب رمزهایی مثل «123456» یا «Ali1380» شبیه به بستن در خانه با فویل آلومینیومی است! طولانی بودن رمز عبور اثر
        تصاعدی بیشتری روی افزایش امنیت آن دارد تا استفاده بی‌شمار از نمادهای عجیب.
      </div>
    </div>
  )
}

/* ───────────────── ۱۱) میانبرهای طلایی ───────────────── */

export function ShortcutsTool() {
  const { data } = useApp()
  const [open, setOpen] = useState<number | null>(null)
  if (!data) return null

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-muted/50 p-3.5 text-[11px] leading-6 text-muted-foreground">
        مرکز میانبرهای طلایی امنیت اندروید — سیستم عامل اندروید برای تسریع امور کاربران درگاه‌های امنیتی متعددی دارد که
        معمولاً در تنظیمات پیچیده پیدا کردنشان دشوار است. این پورتال ۱۳ میانبر حیاتی را یکجا در دسترس شما قرار می‌دهد؛
        روی هر مورد بزنید تا راهنمای گام‌به‌گام را ببینید.
      </div>
      {data.shortcuts.map((s, i) => {
        const isOpen = open === s.id
        return (
          <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.3) }}>
            <button
              onClick={() => setOpen(isOpen ? null : s.id)}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-right transition hover:border-primary/50"
              aria-expanded={isOpen}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12">
                <DynIcon name={s.icon} className="h-5 w-5 text-primary" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-extrabold">{s.title}</span>
                <span className="mt-0.5 line-clamp-1 block text-[10.5px] text-muted-foreground">{s.desc}</span>
              </span>
              <ChevronLeft className={`h-4 w-4 shrink-0 text-muted-foreground transition ${isOpen ? '-rotate-90' : ''}`} aria-hidden="true" />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <ol className="mx-3 mt-1.5 space-y-2 rounded-2xl border border-primary/30 bg-primary/5 p-4">
                    {s.steps.split('\n').map((step, j) => (
                      <li key={j} className="flex items-start gap-2.5 text-[12px] leading-6">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg bg-primary text-[10px] font-extrabold text-primary-foreground">
                          {j + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ───────────────── ۱۲) چک‌لیست امنیتی جامع ───────────────── */

export function ChecklistTool() {
  const { data } = useApp()
  const [checked, setChecked] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem(LS.checklist)
      return raw ? (JSON.parse(raw) as number[]) : []
    } catch {
      return []
    }
  })
  const [loaded] = useState(true)

  const toggle = (id: number) => {
    setChecked((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      try {
        localStorage.setItem(LS.checklist, JSON.stringify(next))
      } catch {}
      return next
    })
  }

  const reset = () => {
    setChecked([])
    try {
      localStorage.setItem(LS.checklist, '[]')
    } catch {}
    toast.success('چک‌لیست بازنشانی شد')
  }

  if (!data || !loaded) return null
  const pct = Math.round((checked.length / data.checklist.length) * 100)

  return (
    <div className="space-y-3">
      <div className="rounded-3xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-extrabold">شناسنامه پدافند: چک‌لیست طلایی دفاع سایبری</h2>
            <p className="mt-1 text-[11px] leading-6 text-muted-foreground">
              این چک لیست ارکان پایه دفاع شخصی شما در برابر هک، نفوذ فیشینگ و مهندسی اجتماعی را تشکیل می‌دهد.
            </p>
          </div>
          <button onClick={reset} className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary transition hover:bg-secondary/70" aria-label="بازنشانی چک‌لیست">
            <Trash2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11px]">
            <span className="font-bold text-muted-foreground">میزان تکمیل اقدامات:</span>
            <span className="font-extrabold text-primary">
              {checked.length} از {data.checklist.length} — {pct}٪
            </span>
          </div>
          <Progress value={pct} className="h-2.5" />
        </div>
      </div>

      <div className="space-y-2">
        {data.checklist.map((item) => {
          const isDone = checked.includes(item.id)
          return (
            <motion.label
              key={item.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition ${
                isDone ? 'border-emerald-500/40 bg-emerald-500/8' : 'border-border bg-card hover:border-primary/40'
              }`}
            >
              <Checkbox checked={isDone} onCheckedChange={() => toggle(item.id)} className="mt-0.5" />
              <span className="min-w-0 flex-1">
                <span className={`flex items-center gap-1.5 text-[12.5px] font-extrabold ${isDone ? 'text-emerald-600 dark:text-emerald-400 line-through opacity-80' : ''}`}>
                  <DynIcon name={item.icon} className="h-4 w-4 shrink-0" />
                  {item.title}
                </span>
                <span className="mt-1 block text-[11px] leading-6 text-muted-foreground">{item.desc}</span>
              </span>
            </motion.label>
          )
        })}
      </div>

      {pct === 100 && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-5 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" aria-hidden="true" />
          <p className="mt-2 text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
            تبریک! تمام اقدامات پدافندی انجام شد — شما اکنون یک دژ نفوذناپذیر دارید.
          </p>
        </motion.div>
      )}
    </div>
  )
}

/* ───────────────── ۱۳) نمایش تمام برنامه‌ها ───────────────── */

export function AllAppsTool() {
  const [apps, setApps] = useState<SimApp[] | null>(null)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      const res = await fetch('/api/apps?filter=all')
      const json = await res.json()
      if (json.ok) setApps(json.apps)
      setLoading(false)
    })()
  }, [])

  const filtered = useMemo(() => {
    if (!apps) return []
    const query = q.trim().toLowerCase()
    if (!query) return apps
    return apps.filter((a) => a.name.toLowerCase().includes(query) || a.packageName.toLowerCase().includes(query))
  }, [apps, q])

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-muted/50 p-3.5 text-[11px] leading-6 text-muted-foreground">
        مشاهده لیست تمام برنامه‌ها به همراه نام بسته و تاریخ نصب برای یافتن برنامه‌های مخرب پنهان — شناسایی برنامه‌های
        پنهان کاربردی و بررسی وضعیت مجوز اپلیکیشن.
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو میان نام برنامه‌ها یا نام بسته‌ها..."
          className="h-11 rounded-2xl bg-card pr-9"
          aria-label="جستجوی برنامه‌ها"
        />
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : (
        <>
          <p className="text-[11px] text-muted-foreground">وضعیت فیلتر: {filtered.length} برنامه یافت شد</p>
          <div className="max-h-[60vh] space-y-2 overflow-y-auto pl-1">
            {filtered.map((a) => (
              <AppRow key={a.packageName} app={a} badge={
                <span className="flex shrink-0 items-center gap-1 rounded-lg bg-muted px-2 py-1 text-[9px] text-muted-foreground">
                  <CalendarDays className="h-3 w-3" aria-hidden="true" />
                  {faDate(a.installDate)}
                </span>
              } />
            ))}
            {filtered.length === 0 && <p className="py-8 text-center text-sm text-muted-foreground">برنامه‌ای یافت نشد</p>}
          </div>
        </>
      )}
    </div>
  )
}

/* ───────────────── روتر ابزارها ───────────────── */

const TOOL_ROUTES: Record<string, { pro: boolean; render: () => React.ReactNode }> = {
  'golden-shield': { pro: false, render: () => <GoldenShieldTool /> },
  'hidden-apps': { pro: false, render: () => <HiddenAppsTool /> },
  'recent-apps': { pro: false, render: () => <RecentAppsTool /> },
  'sensitive-permissions': { pro: true, render: () => <SensitivePermissionsTool /> },
  'device-admin': { pro: true, render: () => <SpecialAccessTool config={SPECIAL_CONFIGS['device-admin']} /> },
  accessibility: { pro: true, render: () => <SpecialAccessTool config={SPECIAL_CONFIGS.accessibility} /> },
  overlay: { pro: true, render: () => <SpecialAccessTool config={SPECIAL_CONFIGS.overlay} /> },
  'usage-stats': { pro: true, render: () => <SpecialAccessTool config={SPECIAL_CONFIGS['usage-stats']} /> },
  'password-generator': { pro: false, render: () => <PasswordGeneratorTool /> },
  'password-strength': { pro: false, render: () => <PasswordStrengthTool /> },
  shortcuts: { pro: false, render: () => <ShortcutsTool /> },
  checklist: { pro: false, render: () => <ChecklistTool /> },
  'all-apps': { pro: true, render: () => <AllAppsTool /> },
}

export function ToolScreen({ route }: { route: string }) {
  const conf = TOOL_ROUTES[route]
  if (!conf) {
    return <p className="py-10 text-center text-sm text-muted-foreground">ابزار مورد نظر هنوز توسعه نیافته است.</p>
  }
  if (conf.pro) return <ProGate>{conf.render()}</ProGate>
  return <>{conf.render()}</>
}
