import type { ReactElement } from "react";
import React from "react";
import { getReleases } from "@repo/content/queries";
import { toMusicInfo, VFL_SITE } from "@/utils/content-adapters";
import FancyLine from "@repo/ui/common/FancyLine";
import SectionHeading from "@/components/SectionHeading";
import { createMetadata } from "@/utils/index";

import YoutubeCard from "./components/YoutubeCard";

const title = "Videos & Live Sets";
const description =
  "Watch live sets, DJ mixes, and performances from Vague Frequency Laboratory artists — experimental tech house and electronic music from Seoul.";

export const metadata = createMetadata({
  title,
  description,
  keywords: ["Live Sets", "DJ Mix", "Performance", "Electronic Music", "Seoul"],
  openGraph: {
    url: "/video",
    title,
    description,
  },
  twitter: {
    title,
    description,
  },
  alternates: {
    canonical: "/video",
  },
});

export default async function VideoPage(): Promise<ReactElement> {
  const releases = (await getReleases(VFL_SITE)).map(toMusicInfo);
  // 카드 수만 결정(내용은 인덱스 기반 하드코딩). 라이브 파리티로 5회 반복.
  const musicInfos = Array.from({ length: 5 }, () => releases).flat();

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
                <YoutubeCard
                  key={index}
                  id={index % 2 === 0 ? "1lAXNqA25Bs" : "bikTSiNr08w"}
                  title={
                    index % 2 === 0
                      ? "JUNTARO - Live from Baccarat, Bangkok"
                      : "DJ 믹스 플레이리스트 - Tech House , Afro house : SIELO | PM MU:SE / MIXMIX"
                  }
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
