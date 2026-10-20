'use client'

import { useEffect, useState } from 'react'
import { useApp, LS, type Screen } from '@/lib/store'
import { DynIcon } from './icons'
import { HomeScreen } from './home-screen'
import { LessonsScreen, LessonDetailScreen } from './lessons-screen'
import { ToolsScreen } from './tools-screen'
import { ToolScreen } from './tool-screens'
import { ProScreen } from './pro-screen'
import { SettingsScreen } from './settings-screen'
import { Button } from '@/components/ui/button'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Home, BookOpen, Wrench, Settings as SettingsIcon, ShieldAlert, Crown } from 'lucide-react'

const TAB_TITLES: Record<string, string> = {
  home: 'ضد هک',
  lessons: 'کتابخانه مطالب آموزشی ضد هک',
  tools: 'جعبه ابزار امنیتی پیشرفته',
  settings: 'تنظیمات برنامه',
  pro: 'فعالسازی نسخه حرفه ای',
}

function titleFor(stack: Screen[]): { title: string; isRoot: boolean } {
  const cur = stack[stack.length - 1]
  switch (cur.name) {
    case 'home':
      return { title: TAB_TITLES.home, isRoot: true }
    case 'lessons':
      return { title: TAB_TITLES.lessons, isRoot: true }
    case 'tools':
      return { title: TAB_TITLES.tools, isRoot: true }
    case 'settings':
      return { title: TAB_TITLES.settings, isRoot: true }
    case 'pro':
      return { title: TAB_TITLES.pro, isRoot: false }
    case 'lesson-detail': {
      const d = useApp.getState().data
      const lesson = d?.lessons.find((l) => l.id === cur.id)
      return { title: lesson?.title ?? 'درس آموزشی', isRoot: false }
    }
    case 'tool': {
      const d = useApp.getState().data
      const tool = d?.tools.find((t) => t.route === cur.route)
      return { title: tool?.title ?? 'ابزار امنیتی', isRoot: false }
    }
    default:
      return { title: 'ضد هک', isRoot: true }
  }
}

function Disclaimer({ text, onAccept }: { text: string; onAccept: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-3xl bg-card p-6 shadow-2xl gold-glow"
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-title"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/15">
            <ShieldAlert className="h-7 w-7 text-destructive" aria-hidden="true" />
          </div>
          <div>
            <h2 id="disclaimer-title" className="text-lg font-extrabold text-destructive">
              هشدار خطر
            </h2>
            <p className="text-xs text-muted-foreground">لطفاً پیش از ادامه مطالعه کنید</p>
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto whitespace-pre-line rounded-2xl bg-muted/60 p-4 text-sm leading-7 text-foreground/90">
          {text}
        </div>
        <Button onClick={onAccept} className="mt-5 w-full rounded-2xl py-6 text-base font-bold">
          متوجه شدم و رعایت می‌کنم
        </Button>
      </motion.div>
    </div>
  )
}

const TABS: Array<{ name: Screen['name']; icon: string; label: string }> = [
  { name: 'home', icon: 'Home', label: 'خانه' },
  { name: 'lessons', icon: 'BookOpen', label: 'آموزش‌ها' },
  { name: 'tools', icon: 'Wrench', label: 'ابزارها' },
  { name: 'settings', icon: 'Settings', label: 'تنظیمات' },
]

export function AppShell() {
  const { stack, push, pop, setTab, data, setData, hydrate, isPro, font } = useApp()
  const [showDisclaimer, setShowDisclaimer] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    hydrate()
    ;(async () => {
      try {
        const res = await fetch('/api/bootstrap')
        const json = await res.json()
        if (json.ok) setData(json as never)
      } catch {
        // offline fallback: داده از سرور نرسید، صفحه خطا نمایش داده می‌شود
      }
      setReady(true)
    })()
    try {
      const timer = setTimeout(() => {
        if (!localStorage.getItem(LS.onboarded)) setShowDisclaimer(true)
      }, 0)
      return () => clearTimeout(timer)
    } catch {
      return undefined
    }
  }, [])

  const acceptDisclaimer = () => {
    try {
      localStorage.setItem(LS.onboarded, '1')
    } catch {}
    setShowDisclaimer(false)
  }

  if (!ready || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <div className="pulse-ring relative flex h-20 w-20 items-center justify-center rounded-3xl bg-navy">
          <img src="/logo.svg" alt="لوگوی ضد هک" className="h-14 w-14" />
        </div>
        <p className="text-sm text-muted-foreground">در حال آماده‌سازی سپر امنیتی...</p>
      </div>
    )
  }

  const cur = stack[stack.length - 1]
  const { title, isRoot } = titleFor(stack)

  const screenKey =
    cur.name === 'lesson-detail' ? `lesson-${cur.id}` : cur.name === 'tool' ? `tool-${cur.route}` : cur.name

  const renderScreen = () => {
    switch (cur.name) {
      case 'home':
        return <HomeScreen />
      case 'lessons':
        return <LessonsScreen />
      case 'lesson-detail':
        return <LessonDetailScreen id={cur.id} />
      case 'tools':
        return <ToolsScreen />
      case 'tool':
        return <ToolScreen route={cur.route} />
      case 'pro':
        return <ProScreen />
      case 'settings':
        return <SettingsScreen />
      default:
        return <HomeScreen />
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col font-size-md" data-font={font}>
      {/* شنابرهای نئونی شناور پس‌زمینه */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="neon-orb start-[-12%] top-[-8%] h-64 w-64 bg-primary/25" />
        <div className="neon-orb bottom-[12%] end-[-10%] h-72 w-72 bg-neon-purple/20" style={{ animationDelay: '-8s' }} />
      </div>
      {showDisclaimer && <Disclaimer text={data.disclaimer} onAccept={acceptDisclaimer} />}

      {/* هدر */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 shadow-[0_0_24px_-8px_color-mix(in_oklch,var(--primary)_45%,transparent)] backdrop-blur-xl">
        <div className="glow-line absolute inset-x-0 bottom-0 h-px opacity-80" aria-hidden="true" />
        <div className="mx-auto flex h-14 max-w-lg items-center gap-2 px-4">
          {!isRoot ? (
            <button
              onClick={pop}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary transition hover:bg-secondary/70"
              aria-label="بازگشت"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          ) : (
            <div className="neon-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy">
              <img src="/logo.svg" alt="" className="neon-pulse h-6 w-6" />
            </div>
          )}
          <h1 className="min-w-0 flex-1 truncate text-sm font-bold sm:text-base">{title}</h1>
          {cur.name !== 'pro' && (
            <button
              onClick={() => push({ name: 'pro' })}
              className={`flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition ${
                isPro
                  ? 'bg-primary/15 text-primary'
                  : 'bg-primary text-primary-foreground shadow-md hover:brightness-110'
              }`}
            >
              <Crown className="h-4 w-4" aria-hidden="true" />
              {isPro ? 'پرو فعال است' : 'ارتقا به پرو'}
            </button>
          )}
        </div>
      </header>

      {/* محتوا با انیمیشن */}
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-28 pt-4">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={screenKey}
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 24 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {renderScreen()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* نویگیشن بار پایین */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/85 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_28px_-12px_color-mix(in_oklch,var(--primary)_40%,transparent)] backdrop-blur-xl"
        aria-label="ناوبری اصلی"
      >
        <div className="glow-line absolute inset-x-0 top-0 h-px opacity-60" aria-hidden="true" />
        <div className="mx-auto grid max-w-lg grid-cols-4">
          {TABS.map((tab) => {
            const active = cur.name === tab.name || (tab.name === 'home' && cur.name === 'pro' && false)
            return (
              <button
                key={tab.name}
                onClick={() => setTab({ name: tab.name } as Screen)}
                className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition ${
                  active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <span
                  className={`flex h-8 w-14 items-center justify-center rounded-full transition ${
                    active ? 'bg-primary/15 shadow-[0_0_16px_-2px_color-mix(in_oklch,var(--primary)_60%,transparent)]' : ''
                  }`}
                >
                  <DynIcon name={tab.icon} className={`h-5 w-5 ${active ? 'neon-pulse' : ''}`} />
                </span>
                {tab.label}
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

export { TAB_TITLES }
