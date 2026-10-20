import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { DISCLAIMER_TEXT } from '@/lib/security'

export const dynamic = 'force-dynamic'

/** همه داده‌های پایه اپ در یک فراخوانی */
export async function GET() {
  const [lessons, tools, shortcuts, checklist, state] = await Promise.all([
    db.lesson.findMany({
      orderBy: { id: 'asc' },
      select: { id: true, title: true, subtitle: true, icon: true, isFree: true, readMinutes: true },
    }),
    db.tool.findMany({ orderBy: { id: 'asc' } }),
    db.shortcut.findMany({ orderBy: { id: 'asc' } }),
    db.checklistItem.findMany({ orderBy: { id: 'asc' } }),
    db.deviceState.findUnique({ where: { id: 1 } }),
  ])

  return NextResponse.json({
    ok: true,
    lessons,
    tools,
    shortcuts,
    checklist,
    disclaimer: DISCLAIMER_TEXT,
    lastScanScore: state?.lastScanScore ?? null,
    version: '۱.۱.۰',
    versionName: 'سپر امنیتی آفلاین',
  })
}
