import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "ye0m2 admin",
  description: "ye0m2 admin — 사이트 콘텐츠 관리.",
  // 내부 편집 도구 — 검색엔진 색인 금지.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
