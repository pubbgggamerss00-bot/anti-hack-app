import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { deriveToken } from '@/lib/security'

export const dynamic = 'force-dynamic'

/**
 * شبیه‌سازی فرآیند خرید درون‌برنامه‌ای مایکت (روش اول اپ اصلی)
 * در نسخه وب، پرداخت واقعی انجام نمی‌شود و فعالسازی آزمایشی ثبت می‌گردد.
 */
export async function POST(req: NextRequest) {
  const { deviceCode, plan } = await req.json().catch(() => ({ deviceCode: '', plan: 'pro' }))

  if (!deviceCode) {
    return NextResponse.json({ ok: false, error: 'کد دستگاه یافت نشد' }, { status: 400 })
  }

  const clean = String(deviceCode).trim().toUpperCase()
  const token = deriveToken(clean)

  await db.deviceState.update({ where: { id: 1 }, data: { proActive: true, proMethod: 'myket', proSince: new Date() } })
  await db.activation.create({ data: { deviceCode: clean, token, method: plan === 'yearly' ? 'yearly-support' : 'myket' } })

  return NextResponse.json({
    ok: true,
    token,
    message:
      plan === 'yearly'
        ? 'حمایت معنوی سالانه شما ثبت شد! از تمام امکانات بهره‌مند هستید. 🙏'
        : 'خرید نسخه پرو با موفقیت انجام شد! اکنون از تمام امکانات بهره‌مند هستید.',
  })
}
