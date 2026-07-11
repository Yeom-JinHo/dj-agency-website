import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Anton, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import { Header } from "@/components/header";
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

export const metadata: Metadata = {
  title: "Juntaro",
  description: "Tech House producer and DJ based in Seoul.",
  // og:image·favicon은 컨벤션 파일(opengraph-image.png, icon.png)이 자동 주입한다.
  openGraph: {
    title: "Juntaro",
    description: "Tech House producer and DJ based in Seoul.",
    type: "website",
    siteName: "Juntaro",
  },
  // X는 og:image가 있어도 twitter:card 없이는 대형 미리보기를 띄우지 않는다.
  twitter: {
    card: "summary_large_image",
  },
};

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
        <Header />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
