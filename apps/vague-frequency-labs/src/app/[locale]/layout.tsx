import type { ReactNode } from "react";
import type { Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";

import "@/styles/globals.css";

import { fontClassName } from "@/app/fonts";

import { metadata as meta } from "@/app/config";
import { routing } from "@/i18n/routing";
import { ErrorBoundary } from "@repo/ui/common/ErrorBoundary";
import { createMetadata, localeUrl } from "@/utils";
import { JsonLd } from "@repo/ui/common/JsonLd";
import { organization, website } from "@/app/jsonLd";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { ReactScan } from "@repo/ui/common/ReactScan";

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

// 미지 locale(/foo.bar 등)은 동적 렌더 후 notFound()가 아니라 라우터 단계의
// 정적 _not-found로 보낸다 — 동적 notFound()는 Next 16에서 빈 <html> 셸로 SSR된다.
export const dynamicParams = false;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // 정적 렌더링 유지 — 누락 시 빌드는 통과하지만 동적 렌더로 전락한다.
  setRequestLocale(locale);

  const tError = await getTranslations({ locale, namespace: "Error" });

  return (
    <html lang={locale} className="dark">
      <body className={fontClassName}>
        <JsonLd items={[organization, website]} />
        <ReactScan />
        <ErrorBoundary
          homeHref={localeUrl("/", locale)}
          labels={{
            heading: tError.rich("heading", { br: () => <br /> }),
            body: tError("body"),
            refresh: tError("refresh"),
            home: tError("home"),
          }}
        >
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
          <Analytics />
          <SpeedInsights />
        </ErrorBoundary>
      </body>
    </html>
  );
}
