import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Anton, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { JsonLd } from "@repo/ui/common/JsonLd";

import { Header } from "@/components/header";
import { musicGroup, website } from "@/app/jsonLd";
import { createMetadata, meta } from "@/utils";
import "@/styles/globals.css";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-anton",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  // 500은 /tour 캡션 font-medium용 — 미로드 시 브라우저가 가짜 볼드를 합성한다.
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

// 팩토리가 metadataBase·og/twitter 카드(og:image는 meta.site.ogImage)·도메인 잠금을 채운다.
// favicon은 icon.png 컨벤션 자동 주입. canonical·og:url은 페이지마다 선언한다 — 레이아웃에
// 두면 not-found 등 미선언 라우트가 홈의 canonical을 상속한다.
export const metadata: Metadata = createMetadata({
  title: { default: meta.site.title, template: `%s — ${meta.site.title}` },
  description: meta.site.description,
});

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${anton.variable} ${ibmPlexMono.variable}`}>
      <body className="antialiased">
        <JsonLd items={[musicGroup, website]} />
        <Header />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
