'use client'

import { useApp } from '@/lib/store'
import { DynIcon } from './icons'
import { motion } from 'framer-motion'
import { Lock, Zap } from 'lucide-react'

export function ToolsScreen() {
  const { data, push, isPro } = useApp()
  if (!data) return null

  return (
    <div className="space-y-3">
      <div className="rounded-2xl bg-muted/50 p-3.5 text-[11px] leading-6 text-muted-foreground">
        جعبه ابزارهای امنیتی پایه‌ای و پیشرفته — {data.tools.length} ابزار و پایشگر سیستم شامل سپر امنیتی طلایی،
        پنهان‌یاب و بازرس دسترسی‌ها. طراحی‌شده بر پایه الگوریتم‌های ممیزی آفلاین اندروید برای ردیابی دسترسی‌های خلاف
        ضوابط حریم شخصی.
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {data.tools.map((tool, i) => {
          const locked = tool.isPro && !isPro
          return (
            <motion.button
              key={tool.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.04, 0.5) }}
              onClick={() => push({ name: 'tool', route: tool.route })}
              className={`relative flex flex-col items-start gap-2 rounded-3xl border border-border bg-card p-4 text-right transition hover:border-primary/50 hover:shadow-lg ${
                tool.id === 1 ? 'gold-glow' : ''
              }`}
            >
              <span className="flex w-full items-center justify-between">
                <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tool.id === 1 ? 'bg-primary' : 'bg-primary/12'}`}>
                  <DynIcon name={tool.icon} className={`h-6 w-6 ${tool.id === 1 ? 'text-primary-foreground' : 'text-primary'}`} />
                </span>
                {locked ? (
                  <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted">
                    <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </span>
                ) : tool.id === 1 ? (
                  <span className="flex items-center gap-1 rounded-full bg-primary/15 px-2 py-1 text-[9px] font-bold text-primary">
                    <Zap className="h-3 w-3" aria-hidden="true" />
                    پیشنهاد طلایی سیستم
                  </span>
                ) : null}
              </span>
              <span className="text-[13px] font-extrabold leading-6">{tool.title}</span>
              <span className="line-clamp-2 text-[11px] leading-5 text-muted-foreground">{tool.subtitle}</span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
