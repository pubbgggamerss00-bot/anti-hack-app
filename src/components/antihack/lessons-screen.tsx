'use client'

import { useEffect, useState } from 'react'
import { useApp } from '@/lib/store'
import { DynIcon } from './icons'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search, Clock, Lock, Crown, AlertTriangle, Lightbulb, XCircle, Target, Flag,
  FileText, BookOpen, ChevronLeft,
} from 'lucide-react'

type LessonFull = {
  id: number
  title: string
  subtitle: string
  icon: string
  intro: string
  sectionTitle: string
  text: string
  alert: string
  note: string
  mistake: string
  action: string
  summary: string
  isFree: boolean
  readMinutes: number
}

/** لیست ۲۰ درس */
export function LessonsScreen() {
  const { data, push, isPro } = useApp()
  const [q, setQ] = useState('')

  if (!data) return null
  const lessons = data.lessons.filter(
    (l) => l.title.includes(q.trim()) || l.subtitle.includes(q.trim())
  )

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-muted/50 p-3.5 text-[11px] leading-6 text-muted-foreground">
        {data.lessons.length} مقاله تخصصی و راهنمای تفصیلی پاکسازی هک، امنیت کاربری و پیشگیری از نفوذ سایبری — اصول
        ریاضی و تجربی، قدم به قدم و موم به موم.
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="جستجو میان مباحث آموزشی..."
          className="h-11 rounded-2xl bg-card pr-9"
          aria-label="جستجوی درس‌ها"
        />
      </div>

      <div className="space-y-2.5">
        {lessons.map((lesson, i) => {
          const locked = !lesson.isFree && !isPro
          return (
            <motion.button
              key={lesson.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.4) }}
              onClick={() => push({ name: 'lesson-detail', id: lesson.id })}
              className="flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3.5 text-right transition hover:border-primary/50 hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/12">
                <DynIcon name={lesson.icon} className="h-6 w-6 text-primary" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5 text-[13px] font-extrabold leading-6">
                  {lesson.title}
                  {lesson.isFree && (
                    <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                      رایگان
                    </span>
                  )}
                </span>
                <span className="mt-0.5 line-clamp-2 block text-[11px] leading-5 text-muted-foreground">
                  {lesson.subtitle}
                </span>
                <span className="mt-1 flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Clock className="h-3 w-3" aria-hidden="true" />
                  {lesson.readMinutes} دقیقه مطالعه
                </span>
              </span>
              {locked ? (
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                </span>
              ) : (
                <ChevronLeft className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              )}
            </motion.button>
          )
        })}
        {lessons.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">مبحثی با این عبارت یافت نشد</p>
        )}
      </div>
    </div>
  )
}

/** جزئیات یک درس با ساختار کامل اپ اصلی */
export function LessonDetailScreen({ id }: { id: number }) {
  const { isPro, push } = useApp()
  const [lesson, setLesson] = useState<LessonFull | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`/api/lessons/${id}`)
        const json = await res.json()
        if (json.ok) setLesson(json.lesson)
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    )
  }

  if (!lesson) {
    return <p className="py-10 text-center text-sm text-muted-foreground">درس یافت نشد</p>
  }

  if (!lesson.isFree && !isPro) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-3xl border border-primary/40 bg-card p-8 text-center gold-glow">
        <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/15">
          <Crown className="h-8 w-8 text-primary" aria-hidden="true" />
        </span>
        <h2 className="text-base font-extrabold">این بخش در نسخه حرفه‌ای فعال است</h2>
        <p className="max-w-xs text-xs leading-6 text-muted-foreground">
          با یک‌بار فعالسازی نسخه پرو، به تمامی ۲۰ درس جامع آموزشی ضد هک و ۱۳ ابزار پیشرفته امنیتی شامل پنهان‌یاب
          بدافزار، کاوشگر دسترسی‌ها و سپر اسکن سریع نفوذ دسترسی نامحدود و مادام‌العمر پیدا کنید.
        </p>
        <Button onClick={() => push({ name: 'pro' })} className="w-full rounded-2xl py-5 font-extrabold">
          ارتقا و فعالسازی
        </Button>
      </div>
    )
  }

  return (
    <article className="space-y-3.5 pb-4" aria-label={`درس: ${lesson.title}`}>
      {/* سربرگ درس */}
      <header className="rounded-3xl bg-navy p-5 text-white">
        <div className="flex items-start gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10">
            <DynIcon name={lesson.icon} className="h-6 w-6 text-primary" />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-extrabold leading-7">{lesson.title}</h2>
            <p className="mt-1 text-[11px] leading-5 text-white/70">{lesson.subtitle}</p>
          </div>
        </div>
      </header>

      {/* مقدمه */}
      <Block icon={BookOpen} tone="neutral" title="مقدمه">
        {lesson.intro}
      </Block>

      {/* بخش اصلی */}
      <section className="rounded-3xl border border-primary/40 bg-card p-4">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-extrabold text-primary">
          <FileText className="h-4 w-4" aria-hidden="true" />
          {lesson.sectionTitle}
        </h3>
        <p className="text-[13px] leading-8 text-foreground/90">{lesson.text}</p>
      </section>

      <Block icon={AlertTriangle} tone="danger" title="هشدار خطر">
        {lesson.alert}
      </Block>
      <Block icon={Lightbulb} tone="gold" title="نکته">
        {lesson.note}
      </Block>
      <Block icon={XCircle} tone="warning" title="اشتباه رایج">
        {lesson.mistake}
      </Block>
      <Block icon={Target} tone="action" title="اقدام فوری پیشنهادی">
        {lesson.action}
      </Block>
      <Block icon={Flag} tone="summary" title="جمعبندی">
        {lesson.summary}
      </Block>
    </article>
  )
}

function Block({
  icon: Icon,
  tone,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>
  tone: 'neutral' | 'danger' | 'gold' | 'warning' | 'action' | 'summary'
  title: string
  children: React.ReactNode
}) {
  const tones: Record<string, string> = {
    neutral: 'border-border bg-card text-foreground',
    danger: 'border-destructive/30 bg-destructive/8 text-foreground',
    gold: 'border-primary/35 bg-primary/8 text-foreground',
    warning: 'border-amber-500/35 bg-amber-500/8 text-foreground',
    action: 'border-emerald-500/35 bg-emerald-500/8 text-foreground',
    summary: 'border-border bg-secondary text-foreground',
  }
  const iconTones: Record<string, string> = {
    neutral: 'bg-primary/15 text-primary',
    danger: 'bg-destructive/15 text-destructive',
    gold: 'bg-primary/15 text-primary',
    warning: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    action: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    summary: 'bg-secondary text-foreground',
  }
  return (
    <section className={`rounded-3xl border p-4 ${tones[tone]}`} aria-label={title}>
      <h3 className="mb-1.5 flex items-center gap-2 text-[13px] font-extrabold">
        <span className={`flex h-7 w-7 items-center justify-center rounded-lg ${iconTones[tone]}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        {title}
      </h3>
      <p className="text-[12.5px] leading-7 text-foreground/85">{children}</p>
    </section>
  )
}
