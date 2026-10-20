'use client'

import { useState } from 'react'
import { useApp } from '@/lib/store'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Crown, Sparkles, CheckCircle2, Loader2, ShieldCheck, BookOpen, Wrench, BadgeCheck } from 'lucide-react'
import { toast } from 'sonner'

const PRO_FEATURES = [
  { icon: BookOpen, title: 'بازگشایی کل ۲۰ مبحث تفصیلی رفع هک اکانت‌ها', desc: 'اینستاگرام، تلگرام، واتساپ، جیمیل، روبیکا، ایتا، شاد، حساب گوگل و...' },
  { icon: Wrench, title: '۱۳ ابزار و پایشگر سیستم', desc: 'شامل سپر امنیتی طلایی، پنهان‌یاب و بازرس دسترسی‌ها' },
  { icon: ShieldCheck, title: 'اسکن کامل سپر طلایی', desc: 'بررسی چندوجهی امنیت سیستم‌عامل و رفع خودکار مسائل' },
  { icon: BadgeCheck, title: 'دسترسی نامحدود و مادام‌العمر', desc: 'از دسترسی کاملاً نامحدود و امن لذت ببرید' },
]

export function ProScreen() {
  const { isPro, setPro, deviceCode } = useApp()
  const [buying, setBuying] = useState(false)
  const [buyStep, setBuyStep] = useState(0)

  // شبیه‌سازی فرآیند خرید مایکت
  const simulateMyket = async () => {
    setBuying(true)
    setBuyStep(0)
    const steps = ['اتصال به مایکت موفق بود. بررسی خریدهای قبلی...', 'در حال انتقال به درگاه امن مایکت...', 'در حال ثبت و تایید تراکنش...']
    for (let i = 0; i < steps.length; i++) {
      setBuyStep(i)
      await new Promise((r) => setTimeout(r, 1100))
    }
    const res = await fetch('/api/pro/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ deviceCode }),
    })
    const json = await res.json()
    if (json.ok) {
      setPro(true)
      toast.success('خرید نسخه پرو با موفقیت انجام شد!')
    } else {
      toast.error(json.error ?? 'خطا در انجام خرید یا انصراف کاربر')
    }
    setBuying(false)
  }

  return (
    <div className="space-y-4 pb-6">
      {/* هیرو */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-navy p-6 text-center text-white gold-glow"
      >
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-primary/25 blur-3xl" aria-hidden="true" />
        <div className="relative">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary text-primary-foreground">
            <Crown className="h-8 w-8" aria-hidden="true" />
          </span>
          <h2 className="mt-3 text-lg font-extrabold text-primary">ارتقا به نسخه پرو و ورود به قلمرو امنیت محض</h2>
          <p className="mt-1.5 text-[11px] leading-6 text-white/75">
            با یک‌بار فعالسازی نسخه پرو، به تمامی ۲۰ درس جامع آموزشی ضد هک و ۱۳ ابزار پیشرفته امنیتی شامل پنهان‌یاب
            بدافزار، کاوشگر دسترسی‌ها و سپر اسکن سریع نفوذ دسترسی نامحدود و مادام‌العمر پیدا کنید.
          </p>
        </div>
      </motion.section>

      {isPro ? (
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="rounded-3xl border border-emerald-500/40 bg-emerald-500/10 p-6 text-center">
          <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" aria-hidden="true" />
          <h3 className="mt-2 text-base font-extrabold text-emerald-600 dark:text-emerald-400">تبریک! برنامه با موفقیت به نسخه پرو ارتقا یافت.</h3>
          <p className="mt-1 text-xs text-muted-foreground">کاربر لایسنس فعال دارد — از تمام امکانات بهره‌مند هستید.</p>
          <Button onClick={() => setPro(false)} variant="outline" className="mt-4 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10">
            غیرفعالسازی لایسنس (تست)
          </Button>
        </motion.div>
      ) : (
        <>
          {/* ویژگی‌ها */}
          <section className="space-y-2" aria-label="ویژگی‌های نسخه حرفه‌ای">
            <h3 className="px-1 text-sm font-extrabold">ویژگی‌های بی‌نظیر نسخه حرفه‌ای (PRO):</h3>
            {PRO_FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="flex items-start gap-3 rounded-2xl border border-border bg-card p-3.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/12">
                  <f.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-[12.5px] font-extrabold">{f.title}</p>
                  <p className="mt-0.5 text-[11px] leading-5 text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </section>

          {/* فعال‌سازی مایکت */}
          <section className="rounded-3xl border border-border bg-card p-4" aria-label="فعال‌سازی و ارتقا">
            <h3 className="mb-3 text-sm font-extrabold">فعال‌سازی و ارتقای نسخه پرو:</h3>

            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
              <p className="rounded-2xl bg-muted/60 p-3 text-[11px] leading-6 text-muted-foreground">
                درگاه امن خرید مستقیم درون‌برنامه‌ای فروشگاه مایکت. فعال‌سازی ۱۰۰٪ آنی بدون دریافت کد فعالساز.
              </p>
              {buying ? (
                <div className="space-y-2 rounded-2xl border border-primary/40 bg-primary/5 p-4">
                  <p className="flex items-center gap-2 text-xs font-bold text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    در حال پردازش...
                  </p>
                  <ul className="space-y-1.5 text-[11px] text-muted-foreground">
                    {['اتصال به مایکت موفق بود. بررسی خریدهای قبلی...', 'در حال انتقال به درگاه امن مایکت...', 'در حال ثبت و تایید تراکنش...'].map((s, i) => (
                      <li key={s} className={i <= buyStep ? 'font-bold text-foreground' : ''}>
                        {i < buyStep ? '✓ ' : i === buyStep ? '• ' : '○ '}
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <Button onClick={simulateMyket} className="w-full rounded-2xl bg-primary py-5 font-extrabold text-primary-foreground hover:brightness-110">
                  <Sparkles className="ml-1 h-4 w-4" aria-hidden="true" />
                  خرید و فعال‌سازی آنلاین با مایکت
                </Button>
              )}
            </motion.div>
          </section>

          <p className="rounded-2xl bg-muted/50 p-3.5 text-[10.5px] leading-6 text-muted-foreground">
            هزینه نسخه حرفه‌ای برنامه بسیار ناچیز در نظر گرفته شده و تقریباً در حد قیمت یک بسته چیپس است. هدف اصلی این
            پروژه افزایش آگاهی امنیتی کاربران و توسعه ابزارهای کاربردی برای حفظ حریم خصوصی است.
          </p>
        </>
      )}
    </div>
  )
}
