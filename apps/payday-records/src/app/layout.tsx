import { Anton, Bricolage_Grotesque, UnifrakturCook } from "next/font/google";
import type { ReactNode } from "react";
import type { Viewport } from "next";

import "@/styles/globals.css";

import { metadata as meta } from "@/app/config";
import { Providers } from "@repo/ui/common/Providers";
import { ErrorBoundary } from "@repo/ui/common/ErrorBoundary";
import { createMetadata } from "@/utils";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ReactScan } from "@repo/ui/common/ReactScan";

// https://iamsteve.me/blog/the-best-ink-trap-typefaces-for-websites
const bricolage_grotesque = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
});

// Condensed gothic face — kept for small/legibility-critical spots (header wordmark).
const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-anton",
});

// Heavy blackletter display face — matches the bold, angular hero wordmark
// on large headings + marquee.
const blackletter = UnifrakturCook({
  weight: "700",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-blackletter",
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
      <body
        className={`${bricolage_grotesque.className} ${anton.variable} ${blackletter.variable} antialiased`}
      >
        <ReactScan />
        <ErrorBoundary>
          <Providers>
            {children}
            <Analytics />
            <SpeedInsights />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
