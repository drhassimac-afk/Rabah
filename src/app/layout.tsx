import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "RabahDj - شبكتك الاجتماعية المحلية",
  description: "تواصل مع أصدقائك وعائلتك عبر شبكتك الاجتماعية المحلية بدون إنترنت",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="gradient-bg min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
