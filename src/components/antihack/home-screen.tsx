'use client'

import { useApp } from '@/lib/store'
import { DynIcon } from './icons'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ShieldCheck, BookOpen, Wrench, ShieldAlert, Sparkles, ChevronLeft, ListChecks, Zap, Crown, CheckCircle2 } from 'lucide-react'

export function HomeScreen() {
  const { data, push, isPro } = useApp()
  if (!data) return null

  const freeLessons = data.lessons.filter((l) => l.isFree).length
  const score = data.lastScanScore

  const scoreColor = score === null ? 'text-muted-foreground' : score >= 90 ? 'text-emerald-500' : score >= 70 ? 'text-primary' : 'text-destructive'

  return (
    <div className="space-y-4">
      {/* هیرو نئونی */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="neon-hero gold-glow relative overflow-hidden rounded-3xl p-5 text-white"
      >
        <div className="absolute -left-8 -top-8 h-36 w-36 rounded-full bg-primary/30 blur-2xl" aria-hidden="true" />
        <div className="absolute -bottom-10 -right-6 h-32 w-32 rounded-full bg-neon-purple/25 blur-2xl" aria-hidden="true" />
        <div className="absolute left-1/2 top-1/3 h-24 w-24 -translate-x-1/2 rounded-full bg-neon-pink/15 blur-2xl" aria-hidden="true" />
        <div className="relative flex items-center gap-4">
          <img src="/logo.svg" alt="لوگوی ضد هک — سپر نئونی" className="neon-pulse h-16 w-16 shrink-0 drop-shadow-[0_0_18px_rgba(56,189,248,0.65)]" />
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold">
              اپلیکیشن امنیتی <span className="neon-text">ضد هک</span>
            </h2>
            <p className="text-xs leading-6 text-white/75">مرجع آفلاین حریم خصوصی و امنیت</p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="rounded-full border border-primary/50 bg-primary/20 px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground shadow-[0_0_10px_-2px_color-mix(in_oklch,var(--primary)_70%,transparent)]">۱۰۰٪ آفلاین</span>
              <span className="rounded-full border border-neon-purple/50 bg-neon-purple/20 px-2.5 py-0.5 text-[11px] font-bold">۲۰ مبحث جامع</span>
              <span className="rounded-full border border-neon-pink/50 bg-neon-pink/20 px-2.5 py-0.5 text-[11px] font-bold">۱۳ ابزار مجهز</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* امتیاز اسکن */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="rounded-3xl border border-border bg-card p-4"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15">
              <ShieldCheck className="h-7 w-7 text-primary" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold">امتیاز سلامت امنیتی گوشی</h3>
              <p className="text-[11px] leading-5 text-muted-foreground">میزان مصونیت دفاعی تلفن شما</p>
            </div>
          </div>
          <div className={`text-3xl font-extrabold ${scoreColor}`} aria-live="polite">
            {score === null ? '—' : `${score}٪`}
          </div>
        </div>
        {score !== null && (
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              className={`h-full rounded-full ${score >= 90 ? 'bg-emerald-500' : score >= 70 ? 'bg-primary' : 'bg-destructive'}`}
            />
          </div>
        )}
        <Button
          onClick={() => push({ name: 'tool', route: 'golden-shield' })}
          className="mt-3 w-full rounded-2xl bg-primary py-5 font-extrabold text-primary-foreground hover:brightness-110"
        >
          <Zap className="ml-1 h-4 w-4" aria-hidden="true" />
          {score === null ? 'راه‌اندازی اسکن کامل سپر طلایی گوشی' : 'تکرار مجدد اسکن'}
        </Button>
      </motion.section>

      {/* دسته‌بندی‌های اصلی */}
      <section aria-label="دسته‌بندی‌های اصلی برنامه" className="grid grid-cols-2 gap-3">
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => push({ name: 'lessons' })}
          className="group flex flex-col items-start gap-2 rounded-3xl border border-border bg-card p-4 text-right transition hover:border-primary/50 hover:shadow-lg"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neon-cyan/40 bg-neon-cyan/15 shadow-[0_0_14px_-2px_color-mix(in_oklch,var(--neon-cyan)_60%,transparent)]">
            <BookOpen className="h-6 w-6 text-neon-cyan" aria-hidden="true" />
          </span>
          <span className="text-sm font-extrabold">کتابخانه آموزشی</span>
          <span className="text-[11px] leading-5 text-muted-foreground">
            {data.lessons.length} مقاله تخصصی و راهنمای تفصیلی پاکسازی هک
          </span>
          <span className="mt-auto flex items-center gap-1 text-[11px] font-bold text-primary">
            {freeLessons} درس رایگان
            <ChevronLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
          </span>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onClick={() => push({ name: 'tools' })}
          className="group flex flex-col items-start gap-2 rounded-3xl border border-border bg-card p-4 text-right transition hover:border-primary/50 hover:shadow-lg"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neon-pink/40 bg-neon-pink/15 shadow-[0_0_14px_-2px_color-mix(in_oklch,var(--neon-pink)_60%,transparent)]">
            <Wrench className="h-6 w-6 text-neon-pink" aria-hidden="true" />
          </span>
          <span className="text-sm font-extrabold">جعبه ابزار امنیتی</span>
          <span className="text-[11px] leading-5 text-muted-foreground">
            {data.tools.length} ابزار و پایشگر سیستم شامل سپر طلایی، پنهان‌یاب و بازرس دسترسی‌ها
          </span>
          <span className="mt-auto flex items-center gap-1 text-[11px] font-bold text-primary">
            ورود به ابزارها
            <ChevronLeft className="h-3.5 w-3.5 transition group-hover:-translate-x-0.5" />
          </span>
        </motion.button>
      </section>

      {/* میانبرها */}
      <section aria-label="میانبرهای سریع" className="grid grid-cols-2 gap-3">
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onClick={() => push({ name: 'tool', route: 'checklist' })}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-right transition hover:border-primary/50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neon-green/40 bg-neon-green/15 shadow-[0_0_12px_-2px_color-mix(in_oklch,var(--neon-green)_55%,transparent)]">
            <ListChecks className="h-5 w-5 text-neon-green" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-extrabold">شناسنامه پدافند</span>
            <span className="block text-[10px] text-muted-foreground">چک‌لیست طلایی {data.checklist.length} موردی</span>
          </span>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          onClick={() => push({ name: 'tool', route: 'password-generator' })}
          className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-right transition hover:border-primary/50"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neon-purple/40 bg-neon-purple/15 shadow-[0_0_12px_-2px_color-mix(in_oklch,var(--neon-purple)_55%,transparent)]">
            <Zap className="h-5 w-5 text-neon-purple" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-xs font-extrabold">ساخت رمز عبور قوی</span>
            <span className="block text-[10px] text-muted-foreground">تولیدکننده آفلاین غیرقابل کرک</span>
          </span>
        </motion.button>
      </section>

      {/* کارت پرو */}
      {!isPro && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => push({ name: 'pro' })}
          className="flex w-full items-center gap-3 rounded-3xl border border-primary/40 bg-gradient-to-l from-primary/15 via-primary/5 to-transparent p-4 text-right transition hover:shadow-lg gold-glow"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Crown className="h-6 w-6" aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-1.5 text-sm font-extrabold text-primary">
              ارتقا به نسخه پرو / خرید از مایکت
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="mt-0.5 block text-[11px] leading-5 text-muted-foreground">
              بازگشایی کل ۲۰ مبحث تفصیلی رفع هک اکانت‌ها و ۱۳ ابزار پیشرفته امنیتی — از دسترسی کاملاً نامحدود و امن لذت ببرید
            </span>
          </span>
        </motion.button>
      )}

      {/* وضعیت پرو */}
      {isPro && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3 rounded-3xl border border-primary/40 bg-primary/10 p-4"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Crown className="h-6 w-6" aria-hidden="true" />
          </span>
          <div>
            <p className="flex items-center gap-1.5 text-sm font-extrabold text-primary">
              نسخه پرو فعال است
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            </p>
            <p className="text-[11px] text-muted-foreground">از دسترسی کاملاً نامحدود و امن لذت ببرید</p>
          </div>
        </motion.div>
      )}

      {/* درباره */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl bg-muted/50 p-4 text-[11px] leading-6 text-muted-foreground"
      >
        هدف این برنامه افزایش سطح آگاهی سایبری عموم مردم، تامین امنیت شبکه‌های اجتماعی و حفظ حریم خصوصی است. تمامی
        محتواها و کدهای موجود به صورت کاملاً مستقل و ۱۰۰٪ آفلاین توسعه یافته است.
      </motion.p>
    </div>
  )
}
