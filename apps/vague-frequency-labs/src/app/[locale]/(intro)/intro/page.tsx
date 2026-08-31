import { Intro } from "@repo/ui/features/intro";
import { getAppUrls } from "@repo/utils/app-urls";
import { setRequestLocale } from "next-intl/server";
import { localizedMetadata, localeUrl } from "@/utils/index";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return {
    ...(await localizedMetadata({
      locale,
      path: "/intro",
      namespace: "intro",
      keywords: ["Electronic Music", "Seoul", "Independent Label"],
      alternates: false,
    })),
    // Gate/entry page — keep it out of the index; the home page carries SEO.
    // noindex 페이지에는 canonical/hreflang(alternates)을 의도적으로 달지 않는다.
    robots: { index: false, follow: true },
  };
}

export default async function IntroPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Intro
      currentApp="vague-frequency-labs"
      appUrls={getAppUrls()}
      homeHref={localeUrl("/", locale)}
    />
  );
}
