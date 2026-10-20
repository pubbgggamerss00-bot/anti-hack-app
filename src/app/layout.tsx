import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "ضد هک | سپر امنیتی آفلاین",
  description:
    "اپلیکیشن امنیتی ضد هک (Anti Hack) — مرجع آفلاین حریم خصوصی و امنیت: ۲۰ مبحث جامع آموزشی، ۱۳ ابزار امنیتی، اسکن سپر طلایی، چک‌لیست پدافند و تولید رمز عبور قوی",
  keywords: ["ضد هک", "امنیت", "هک", "حریم خصوصی", "Anti Hack", "امنیت اندروید", "فیشینگ"],
  authors: [{ name: "Abbas Tech" }],
  icons: {
    icon: "/logo.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#161d29",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
