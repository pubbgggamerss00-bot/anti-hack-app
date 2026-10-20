'use client'

import { useApp } from '@/lib/store'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Crown, Moon, Sun, Type, ShieldCheck, Info, Smartphone, CheckCircle2 } from 'lucide-react'

const FONTS = [
  { key: 'sm', label: 'کوچک' },
  { key: 'md', label: 'متوسط' },
  { key: 'lg', label: 'بزرگ' },
  { key: 'xl', label: 'بسیار بزرگ' },
] as const

export function SettingsScreen() {
  const { theme, setTheme, font, setFont, isPro, push, data } = useApp()

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
            نسخه {data?.version ?? '۱.۱.۰'} ({data?.versionName ?? 'سپر امنیتی آفلاین'})
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
    </div>
  )
}
