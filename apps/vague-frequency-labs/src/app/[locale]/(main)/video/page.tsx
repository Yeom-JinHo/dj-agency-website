import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { musicInfo } from "@/source";
import { BlurFade } from "@repo/ui/common/BlurFade";
import FancyLine from "@repo/ui/common/FancyLine";
import SectionHeading from "@/components/SectionHeading";
import { createMetadata, localeAlternates, localeUrl, ogLocale } from "@/utils/index";

import YoutubeCard from "./components/YoutubeCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.video" });
  const title = t("title");
  const description = t("description");
  return createMetadata({
    title,
    description,
    keywords: ["Live Sets", "DJ Mix", "Performance", "Electronic Music", "Seoul"],
    openGraph: {
      url: localeUrl("/video", locale),
      title,
      description,
      locale: ogLocale(locale),
    },
    twitter: {
      title,
      description,
    },
    alternates: localeAlternates("/video", locale),
  });
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const musicInfos = [
    ...musicInfo.getInfos(),
    ...musicInfo.getInfos(),
    ...musicInfo.getInfos(),
    ...musicInfo.getInfos(),
    ...musicInfo.getInfos(),
  ];

  return (
    <main className="my-16 flex-1">
      <section
        className="relative flex min-h-[calc(50dvh)] items-center justify-center"
        id="video"
      >
        <div className="flex w-full flex-col items-center md:max-w-7xl">
          <SectionHeading as="h1" variant="page">
            Video
          </SectionHeading>

          <FancyLine className={"mt-16"} />
          <div className="relative mt-16 flex flex-col items-center justify-center gap-4 overflow-hidden">
            <div className="flex flex-wrap justify-center">
              {musicInfos.map((info, index) => (
                <BlurFade
                  key={index}
                  inView
                  duration={0.6}
                  className="relative w-full md:w-[640px]"
                >
                  <YoutubeCard
                    id={index % 2 === 0 ? "1lAXNqA25Bs" : "bikTSiNr08w"}
                    title={
                      index % 2 === 0
                        ? "JUNTARO - Live from Baccarat, Bangkok"
                        : "DJ 믹스 플레이리스트 - Tech House , Afro house : SIELO | PM MU:SE / MIXMIX"
                    }
                  />
                </BlurFade>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
