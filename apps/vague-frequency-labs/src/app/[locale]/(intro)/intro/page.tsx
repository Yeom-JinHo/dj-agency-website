import { Intro } from "@repo/ui/features/intro";
import { getAppUrls } from "@repo/utils/app-urls";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createMetadata, localeUrl, ogLocale } from "@/utils/index";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.intro" });
  const title = t("title");
  const description = t("description");
  return {
    ...createMetadata({
      title,
      description,
      keywords: ["Electronic Music", "Seoul", "Independent Label"],
      openGraph: {
        url: localeUrl("/intro", locale),
        title,
        description,
        locale: ogLocale(locale),
      },
      twitter: {
        title,
        description,
      },
    }),
    // Gate/entry page — keep it out of the index; the home page carries SEO.
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

  return <Intro currentApp="vague-frequency-labs" appUrls={getAppUrls()} />;
}
