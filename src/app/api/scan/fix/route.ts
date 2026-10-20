import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

const REMOVAL_BY_ACTION: Record<string, { name: string; signatureOk: boolean }> = {
  'com.speed.cleaner.pro': { name: 'Speed Cleaner Pro', signatureOk: true },
  'ir.persian.sms.forwarder': { name: 'SMS Backup Forwarder', signatureOk: true },
  'com.gold.flashlight.hd': { name: 'Flashlight HD Ultra', signatureOk: true },
  'com.super.keylogger.sys': { name: 'System Booster X', signatureOk: true },
  'ir.spy.sms.tracker': { name: 'برنامه بدون آیکون (جاسوس)', signatureOk: true },
  'com.free.gems.pubg': { name: 'جم رایگان پابجی ۲۰۲۵', signatureOk: true },
}

/** رفع خودکار یک مسئله امنیتی (مثل اجرای توصیه در اپ اصلی) */
export async function POST(req: NextRequest) {
  const { action } = await req.json().catch(() => ({ action: null }))
  if (!action) return NextResponse.json({ ok: false, error: 'اقدام نامعتبر' }, { status: 400 })

  let message = 'مشکل با موفقیت رفع شد!'

  switch (action) {
    case 'enable-screen-lock':
      await db.deviceState.update({ where: { id: 1 }, data: { screenLock: 'fingerprint' } })
      message = 'قفل اثر انگشت فعال شد'
      break
    case 'disable-usb':
      await db.deviceState.update({ where: { id: 1 }, data: { usbDebugging: false } })
      message = 'عیب‌یابی USB خاموش شد'
      break
    case 'enable-play-protect':
      await db.deviceState.update({ where: { id: 1 }, data: { playProtect: true } })
      message = 'Google Play Protect فعال شد'
      break
    case 'disable-unknown-sources':
      await db.deviceState.update({ where: { id: 1 }, data: { unknownSources: false } })
      message = 'نصب از مراجع ناشناس بسته شد'
      break
    case 'enable-fmd':
      await db.deviceState.update({ where: { id: 1 }, data: { findMyDevice: true } })
      message = 'Find My Device فعال شد'
      break
    case 'enable-sim-pin':
      await db.deviceState.update({ where: { id: 1 }, data: { simPin: true } })
      message = 'پین کد سیم‌کارت تنظیم شد'
      break
    case 'update-patch':
    case 'enable-updates':
      await db.deviceState.update({ where: { id: 1 }, data: { autoUpdates: true, securityPatch: new Date().toISOString().slice(0, 10) } })
      message = 'سیستم به آخرین وصله امنیتی بروزرسانی شد'
      break
    case 'restrict-notif':
      await db.deviceState.update({ where: { id: 1 }, data: { notifUnlocked: false } })
      message = 'دسترسی اعلان‌ها محدود شد'
      break
    case 'remove-suspicious': {
      const apps = await db.simApp.findMany({ where: { isSuspicious: true } })
      for (const a of apps) {
        const fix = REMOVAL_BY_ACTION[a.packageName]
        if (fix) {
          await db.simApp.update({
            where: { id: a.id },
            data: {
              isSuspicious: false,
              signatureOk: true,
              isDeviceAdmin: false,
              isAccessibility: false,
              isOverlay: false,
              isUsageAccess: false,
              permissions: '',
            },
          })
        }
      }
      message = 'برنامه‌های مشکوک پاک‌سازی شدند'
      break
    }
    case 'revoke-admin': {
      await db.simApp.updateMany({ where: { isDeviceAdmin: true, isGooglePackage: false }, data: { isDeviceAdmin: false } })
      message = 'دسترسی ادمین برنامه‌های مشکوک لغو شد'
      break
    }
    case 'revoke-accessibility': {
      await db.simApp.updateMany({ where: { isAccessibility: true, isGooglePackage: false }, data: { isAccessibility: false } })
      message = 'سرویس Accessibility برنامه‌های مزاحم غیرفعال شد'
      break
    }
    case 'revoke-overlay': {
      await db.simApp.updateMany({ where: { isOverlay: true, isGooglePackage: false }, data: { isOverlay: false } })
      message = 'مجوز Overlay برنامه‌های مشکوک بسته شد'
      break
    }
    case 'remove-hidden': {
      const hidden = await db.simApp.findMany({ where: { hasLauncherIcon: false, isSystem: false, isGooglePackage: false } })
      await db.simApp.deleteMany({ where: { id: { in: hidden.map((h) => h.id) } } })
      message = 'برنامه‌های پنهان حذف نصب شدند'
      break
    }
    default:
      return NextResponse.json({ ok: false, error: 'اقدام شناخته نشد' }, { status: 400 })
  }

  return NextResponse.json({ ok: true, message })
}
