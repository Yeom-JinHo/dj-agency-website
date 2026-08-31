import { setRequestLocale } from "next-intl/server";
import { localizedMetadata } from "@/utils/index";
import MusicContent from "./MusicContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return localizedMetadata({
    locale,
    path: "/music",
    namespace: "music",
    keywords: [
      "Releases",
      "Discography",
      "Tech House",
      "Bass House",
      "Electronic Music",
    ],
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
