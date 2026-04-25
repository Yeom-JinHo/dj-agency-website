import { Bricolage_Grotesque } from "next/font/google";
import type { ReactNode } from "react";
import type { Viewport } from "next";

import "@/styles/globals.css";

import { metadata as meta } from "@/app/config";
import Providers from "@/app/providers";
import { ErrorBoundary } from "@repo/ui/common/ErrorBoundary";
import { createMetadata } from "@/utils";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ReactScan } from "@/components/ReactScan";

// https://iamsteve.me/blog/the-best-ink-trap-typefaces-for-websites
const bricolage_grotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
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
    <html lang="en" suppressHydrationWarning>
      <body className={`${bricolage_grotesque.className} antialiased`}>
        <ReactScan />
        <ErrorBoundary>
          <Providers>
            {children}
            <Analytics />
            <SpeedInsights />
            {/* <Cursor /> */}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
