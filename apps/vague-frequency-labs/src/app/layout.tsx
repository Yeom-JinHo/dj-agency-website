import type { ReactNode } from "react";
import type { Viewport } from "next";
import { Anton, Do_Hyeon, Space_Mono } from "next/font/google";
import localFont from "next/font/local";

import "@/styles/globals.css";

import { metadata as meta } from "@/app/config";
import { ErrorBoundary } from "@repo/ui/common/ErrorBoundary";
import { createMetadata } from "@/utils";
import { JsonLd } from "@repo/ui/common/JsonLd";
import { organization, website } from "@/app/jsonLd";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ReactScan } from "@repo/ui/common/ReactScan";

const pretendard = localFont({
  src: "../../public/fonts/PretendardStdVariable.woff2",
  display: "swap",
  variable: "--font-pretendard",
  weight: "45 920",
});

// Worldwide hero typography (DJ Hero handoff): condensed poster English +
// condensed Korean display + monospace labels. Do Hyeon matches Anton's
// narrow, tall poster skeleton for Korean; Pretendard is the Korean fallback.
const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-anton",
});

const doHyeon = Do_Hyeon({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-dohyeon",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-space-mono",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${pretendard.variable} ${anton.variable} ${doHyeon.variable} ${spaceMono.variable} font-sans antialiased`}
      >
        <JsonLd items={[organization, website]} />
        <ReactScan />
        <ErrorBoundary>
          {children}
          <Analytics />
          <SpeedInsights />
        </ErrorBoundary>
      </body>
    </html>
  );
}
