'use client'

import { create } from 'zustand'

export type Screen =
  | { name: 'home' }
  | { name: 'lessons' }
  | { name: 'tools' }
  | { name: 'settings' }
  | { name: 'lesson-detail'; id: number }
  | { name: 'tool'; route: string }
  | { name: 'pro' }

export type BootstrapData = {
  lessons: Array<{ id: number; title: string; subtitle: string; icon: string; isFree: boolean; readMinutes: number }>
  tools: Array<{ id: number; title: string; subtitle: string; description: string; icon: string; route: string; isPro: boolean }>
  shortcuts: Array<{ id: number; title: string; desc: string; icon: string; steps: string }>
  checklist: Array<{ id: number; title: string; desc: string; icon: string }>
  disclaimer: string
  lastScanScore: number | null
  version: string
  versionName: string
}

type AppState = {
  // ناوبری
  stack: Screen[]
  push: (s: Screen) => void
  pop: () => void
  setTab: (s: Screen) => void
  // داده
  data: BootstrapData | null
  setData: (d: BootstrapData) => void
  // نسخه پرو (کلاینت‌ساید)
  isPro: boolean
  setPro: (v: boolean) => void
  // تنظیمات
  theme: 'dark' | 'light'
  setTheme: (t: 'dark' | 'light') => void
  font: 'sm' | 'md' | 'lg' | 'xl'
  setFont: (f: 'sm' | 'md' | 'lg' | 'xl') => void
  deviceCode: string
  hydrated: boolean
  hydrate: () => void
}

const LS = {
  pro: 'ainthack-pro',
  theme: 'ainthack-theme',
  font: 'ainthack-font',
  device: 'ainthack-device-code',
  onboarded: 'ainthack-onboarded',
  checklist: 'ainthack-checklist',
}

function randomDeviceCode(): string {
  const chars = 'ABCDEF0123456789'
  const seg = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `${seg()}-${seg()}-${seg()}`
}

export const useApp = create<AppState>((set, get) => ({
  stack: [{ name: 'home' }],
  push: (s) => set((st) => ({ stack: [...st.stack, s] })),
  pop: () =>
    set((st) => (st.stack.length > 1 ? { stack: st.stack.slice(0, -1) } : { stack: [{ name: 'home' }] })),
  setTab: (s) => set({ stack: [s] }),

  data: null,
  setData: (d) => set({ data: d }),

  isPro: false,
  setPro: (v) => {
    try {
      localStorage.setItem(LS.pro, v ? '1' : '0')
    } catch {}
    set({ isPro: v })
  },

  theme: 'dark',
  setTheme: (t) => {
    try {
      localStorage.setItem(LS.theme, t)
    } catch {}
    set({ theme: t })
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', t === 'dark')
    }
  },
  font: 'md',
  setFont: (f) => {
    try {
      localStorage.setItem(LS.font, f)
    } catch {}
    set({ font: f })
  },
  deviceCode: '',
  hydrated: false,

  hydrate: () => {
    if (get().hydrated || typeof window === 'undefined') return
    try {
      const pro = localStorage.getItem(LS.pro) === '1'
      const theme = (localStorage.getItem(LS.theme) as 'dark' | 'light') || 'dark'
      const font = (localStorage.getItem(LS.font) as 'sm' | 'md' | 'lg' | 'xl') || 'md'
      let device = localStorage.getItem(LS.device)
      if (!device) {
        device = randomDeviceCode()
        localStorage.setItem(LS.device, device)
      }
      document.documentElement.classList.toggle('dark', theme === 'dark')
      set({ isPro: pro, theme, font, deviceCode: device, hydrated: true })
    } catch {
      set({ hydrated: true })
    }
  },
}))

export { LS }
