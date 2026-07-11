import type { Viewport } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { JsonLd } from "@repo/ui/common/JsonLd";

import { Header } from "@/components/header";
import { metadata as meta } from "@/app/config";
import { musicGroup, website } from "@/app/jsonLd";
import { createMetadata } from "@/utils";
import "@/styles/globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  // 500은 /tour 캡션 font-medium용 — 미로드 시 브라우저가 가짜 볼드를 합성한다.
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

export const metadata = createMetadata({
  title: {
    absolute: meta.site.title,
    template: `%s | ${meta.site.title}`,
  },
  description: meta.site.description,
  twitter: {
    title: meta.site.title,
    description: meta.site.description,
  },
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
    <html lang="en" className={ibmPlexMono.variable}>
      <body className="antialiased">
        <JsonLd items={[musicGroup, website]} />
        <Header />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
