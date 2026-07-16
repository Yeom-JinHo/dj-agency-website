import { getTranslations, setRequestLocale } from "next-intl/server";
import { createMetadata, localeAlternates, localeUrl, ogLocale } from "@/utils/index";
import MusicContent from "./MusicContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.music" });
  const title = t("title");
  const description = t("description");
  return createMetadata({
    title,
    description,
    keywords: ["Releases", "Discography", "Tech House", "Bass House", "Electronic Music"],
    openGraph: {
      url: localeUrl("/music", locale),
      title,
      description,
      locale: ogLocale(locale),
    },
    twitter: {
      title,
      description,
    },
    alternates: localeAlternates("/music", locale),
  });
}

export default async function MusicPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <MusicContent />;
}
