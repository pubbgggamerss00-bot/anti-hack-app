import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jsonError } from '@/lib/security'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params
  const lessonId = parseInt(id, 10)
  if (isNaN(lessonId)) return jsonError('شناسه درس نامعتبر است')

  const lesson = await db.lesson.findUnique({ where: { id: lessonId } })
  if (!lesson) return jsonError('درس یافت نشد', 404)

  return NextResponse.json({ ok: true, lesson })
}
