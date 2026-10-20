#!/usr/bin/env node
/**
 * ساخت نسخه آفلاین تک‌فایلی اپ «ضد هک» برای قرارگیری در assets اندروید
 * inject: data.json + icons + fonts (base64) + logo
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const project = path.resolve(root, '..');

const template = fs.readFileSync(path.join(root, 'assets-src/index.template.html'), 'utf8');
// منبع داده: android/scripts/data.json (کپی خروجی دیتابیس seed شده)
const data = JSON.parse(fs.readFileSync(path.join(root, 'scripts/data.json'), 'utf8'));
const icons = JSON.parse(fs.readFileSync(path.join(root, 'scripts/icons-final.json'), 'utf8'));

// simApps: تبدیل permissions رشته‌ای به آرایه
data.simApps = data.simApps.map(a => ({ ...a, permissions: a.permissions ? a.permissions.split(',') : [] }));
delete data.id;
for (const a of data.simApps) delete a.id;

const b64 = f => fs.readFileSync(path.join(project, 'public/fonts', f)).toString('base64');
const logo = fs.readFileSync(path.join(project, 'public/logo.svg'), 'utf8')
  .replace(/\n\s*/g, ' ').trim();

const DISCLAIMER = `هدف این برنامه افزایش سطح آگاهی سایبری عموم مردم، تامین امنیت شبکه‌های اجتماعی و حفظ حریم خصوصی است. تمامی محتواها و کدهای موجود به صورت کاملاً مستقل و ۱۰۰٪ آفلاین توسعه یافته است.

هشدار بسیار حیاتی: این برنامه یک ابزار آموزشی و پایشی است و هیچ‌گاه برای نفوذ به سیستم دیگران استفاده نمی‌شود. مسئولیت استفاده غیرقانونی از محتوای آموزشی بر عهده فرد است. پیش از هرگونه لغو دسترسی، از کاربرد اصلی برنامه مطمئن شوید؛ لغو دسترسی برخی برنامه‌های سیستمی ممکن است به عملکرد گوشی آسیب بزند.`;

const out = template
  .replace('__LOGOJSON__', JSON.stringify(logo))
  .replace('__DATA__', JSON.stringify(data))
  .replace('__ICONS__', JSON.stringify(icons))
  .replace('__DISCLAIMER__', JSON.stringify(DISCLAIMER))
  .replace('__FONT400__', b64('Vazirmatn-400.woff2'))
  .replace('__FONT500__', b64('Vazirmatn-500.woff2'))
  .replace('__FONT700__', b64('Vazirmatn-700.woff2'))
  .replace('__FONT800__', b64('Vazirmatn-800.woff2'))
  .replace(/__LOGO__/g, logo);

const destDir = path.join(root, 'app/src/main/assets');
fs.mkdirSync(destDir, { recursive: true });
fs.writeFileSync(path.join(destDir, 'index.html'), out);
console.log('✓ assets/index.html generated:', (out.length / 1024).toFixed(0) + ' KB');
