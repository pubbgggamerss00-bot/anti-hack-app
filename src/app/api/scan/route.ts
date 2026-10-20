import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { computeSecurityFindings } from '@/lib/security'

export const dynamic = 'force-dynamic'

/** اسکن زنده سپر طلایی: مراحل اسکن + امتیاز + مسائل امنیتی */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const step = typeof body.step === 'number' ? body.step : null

  const state = await db.deviceState.findUnique({ where: { id: 1 } })
  if (!state) return NextResponse.json({ ok: false, error: 'وضعیت دستگاه یافت نشد' }, { status: 500 })

  // مرحله‌بندی اسکن (شبیه‌سازی زنده مرحله به مرحله مثل اپ اصلی)
  const scanSteps = [
    { id: 'packages', label: 'در حال بررسی پایگاه بسته‌های اندروید و مراجع پکیج...' },
    { id: 'screenlock', label: 'بررسی قفل صفحه، وضعیت حافظه امنیتی، فیس‌آیدی و اثر انگشت...' },
    { id: 'usb', label: 'بررسی وضعیت عیب‌یابی USB (Developer options)...' },
    { id: 'admin', label: 'آنالیز دسترسی ادمین مشکوک...' },
    { id: 'signature', label: 'تطبیق امضای بسته‌های گوگل موتور...' },
    { id: 'unsigned', label: 'جست‌وجوی برنامه‌های امضانشده...' },
    { id: 'accounts', label: 'بررسی جیمیل‌ها و حساب‌های همسان‌سازی شده ناشناس روی تبلت یا موبایل شما...' },
    { id: 'protect', label: 'اسکن سیستم با موتور زنده گوگل برای یافتن ماژول‌های بدافزار و جاسوسی...' },
    { id: 'root', label: 'ممیزی سیستم‌عامل، ردیابی شبیه‌سازها، مانیتور برنامه‌ها و روت...' },
  ]

  // اگر step داده شده فقط همان مرحله برگردد (اسکن تدریجی سمت کلاینت)
  if (step !== null && step >= 0 && step < scanSteps.length) {
    const apps = await db.simApp.findMany()
    const { score, issues } = computeSecurityFindings(state, apps)
    const current = scanSteps[step]
    let status: 'ok' | 'warn' | 'danger' = 'ok'
    let statusLabel = '[سالم]'
    switch (current.id) {
      case 'screenlock':
        status = state.screenLock === 'fingerprint' ? 'ok' : state.screenLock === 'none' ? 'danger' : 'warn'
        statusLabel = state.screenLock === 'fingerprint' ? '[سالم]' : state.screenLock === 'none' ? '[هشدار: بدون قفل]' : '[هشدار: قفل ساده]'
        break
      case 'usb':
        status = state.usbDebugging ? 'danger' : 'ok'
        statusLabel = state.usbDebugging ? '[هشدار: روشن است - تضعیف ایمنی]' : '[سالم]'
        break
      case 'admin': {
        const admins = apps.filter((a) => a.isDeviceAdmin && !a.isGooglePackage)
        status = admins.length ? 'danger' : 'ok'
        statusLabel = admins.length ? '[خطر: دسترسی مشکوک]' : '[سالم]'
        break
      }
      case 'signature':
        status = 'ok'
        statusLabel = '[سالم]'
        break
      case 'unsigned': {
        const bad = apps.filter((a) => !a.signatureOk && !a.isSystem)
        status = bad.length ? 'warn' : 'ok'
        statusLabel = bad.length ? `[هشدار: ${bad.length} بسته امضانشده]` : '[سالم]'
        break
      }
      case 'accounts':
        status = 'ok'
        statusLabel = '[سالم]'
        break
      case 'protect':
        status = state.playProtect ? 'ok' : 'warn'
        statusLabel = state.playProtect ? '[فعال]' : '[غیرفعال]'
        break
      case 'root':
        status = 'ok'
        statusLabel = '[روت نشده]'
        break
      default:
        status = 'ok'
        statusLabel = '...'
    }
    return NextResponse.json({ ok: true, stepDone: false, step: { ...current, status, statusLabel }, score, issues })
  }

  // اسکن کامل
  const apps = await db.simApp.findMany()
  const { score, issues } = computeSecurityFindings(state, apps)
  await db.deviceState.update({ where: { id: 1 }, data: { lastScanScore: score } })
  await db.scanRecord.create({ data: { score, issues: JSON.stringify(issues) } })

  return NextResponse.json({
    ok: true,
    stepDone: true,
    score,
    issues,
    message:
      score >= 90
        ? 'گوشی شما در وضعیت عالی و کاملاً ایمن قرار دارد.'
        : score >= 70
          ? 'پک حفاظتی عالی است، اما برخی آسیب‌پذیری‌های فرعی یافت شد.'
          : 'امنیت گوشی شما در معرض خطر است؛ پیشنهاد طلایی سیستم را اجرا کنید!',
  })
}
