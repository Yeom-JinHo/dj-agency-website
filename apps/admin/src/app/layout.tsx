import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Analytics } from "@vercel/analytics/next";

import { SmallViewportNotice } from "@/components/small-viewport-notice";
import { Toaster } from "@/components/ui/sonner";
import "@/styles/globals.css";

// 한글은 두 폰트의 커버리지 밖이라 자동으로 스택의 다음 글꼴로 폴백된다(globals.css --font-sans/--font-mono 참고).
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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
    <html lang="ko" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        {/* 데스크톱 전용 도구라 lg 미만에서는 본문을 아예 내리고 안내만 남긴다(SmallViewportNotice).
            숨기지 않고 오버레이로 덮기만 하면 보이지 않을 뿐 탭 순서·스크린리더에는 그대로 남는다.
            wrapper는 높이를 제한하지 않으므로 하위의 min-h-svh·min-h-full 체인에 영향이 없다. */}
        <div className="max-lg:hidden">
          {/* 목록의 검색·정렬을 URL 쿼리에 담기 위한 nuqs 어댑터(useQueryState 사용처의 공통 전제). */}
          <NuqsAdapter>{children}</NuqsAdapter>
          <Toaster />
        </div>
        <SmallViewportNotice />
        <Analytics />
      </body>
    </html>
  );
}
