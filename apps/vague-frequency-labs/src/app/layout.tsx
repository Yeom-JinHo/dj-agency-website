import type { ReactNode } from "react";
import { Bricolage_Grotesque } from "next/font/google";

import "@/styles/globals.css";

import { metadata as meta } from "@/app/config";
import Providers from "@/app/providers";
import { ErrorBoundary } from "@repo/ui/common/ErrorBoundary";
import { createMetadata } from "@/utils";
import { Analytics } from "@vercel/analytics/next";
// import { SpeedInsights } from "@vercel/speed-insights/next";

// https://iamsteve.me/blog/the-best-ink-trap-typefaces-for-websites
const bricolage_grotesque = Bricolage_Grotesque({ subsets: ["latin"] });

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

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {process.env.NODE_ENV === "development" && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script
            crossOrigin="anonymous"
            src="https://unpkg.com/react-scan/dist/auto.global.js"
          />
        )}
      </head>
      <body className={`${bricolage_grotesque.className} antialiased`}>
        <ErrorBoundary>
          <Providers>
            {children}
            <Analytics />
            {/* <SpeedInsights /> */}
            {/* <Cursor /> */}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
