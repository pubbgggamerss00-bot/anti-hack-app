import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'

/**
 * لیست برنامه‌های نصب‌شده شبیه‌سازی‌شده دستگاه اندروید
 * فیلترها: hidden | recent | all | permissions | admin | accessibility | overlay | usage
 * perm: sms | gps | camera | contacts | mic
 */
export async function GET(req: NextRequest) {
  const filter = req.nextUrl.searchParams.get('filter') ?? 'all'
  const perm = req.nextUrl.searchParams.get('perm')
  const q = req.nextUrl.searchParams.get('q')?.trim().toLowerCase()

  let apps = await db.simApp.findMany({ orderBy: [{ installDate: 'desc' }] })

  switch (filter) {
    case 'hidden':
      apps = apps.filter((a) => !a.hasLauncherIcon && !a.isSystem && !a.isGooglePackage)
      break
    case 'recent':
      apps = apps.filter((a) => Date.now() - a.installDate.getTime() <= 60 * 86400000)
      break
    case 'admin':
      apps = apps.filter((a) => a.isDeviceAdmin)
      break
    case 'accessibility':
      apps = apps.filter((a) => a.isAccessibility)
      break
    case 'overlay':
      apps = apps.filter((a) => a.isOverlay)
      break
    case 'usage':
      apps = apps.filter((a) => a.isUsageAccess)
      break
    case 'permissions':
      if (perm) apps = apps.filter((a) => a.permissions.split(',').includes(perm))
      break
    case 'all':
    default:
      break
  }

  if (q) {
    apps = apps.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.packageName.toLowerCase().includes(q)
    )
  }

  return NextResponse.json({
    ok: true,
    count: apps.length,
    apps: apps.map((a) => ({
      packageName: a.packageName,
      name: a.name,
      installDate: a.installDate,
      hasLauncherIcon: a.hasLauncherIcon,
      isSystem: a.isSystem,
      isGooglePackage: a.isGooglePackage,
      permissions: a.permissions ? a.permissions.split(',') : [],
      isDeviceAdmin: a.isDeviceAdmin,
      isAccessibility: a.isAccessibility,
      isOverlay: a.isOverlay,
      isUsageAccess: a.isUsageAccess,
      isSuspicious: a.isSuspicious,
      signatureOk: a.signatureOk,
      sizeMb: a.sizeMb,
    })),
  })
}
