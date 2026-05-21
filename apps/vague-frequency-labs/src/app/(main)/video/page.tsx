import type { ReactElement } from "react";
import React from "react";
import { musicInfo } from "@/source";
import FancyLine from "@repo/ui/common/FancyLine";
import TextReveal from "@repo/ui/common/TextReveal";
import { createMetadata } from "@/utils/index";

import YoutubeCard from "./components/YoutubeCard";

const title = "Video";
// 사용자 검토 필요 (영문 메타 카피 초안)
const description =
  "Watch live sets, DJ mixes, and performance videos from Vague Frequency Laboratory artists, featuring tech house and electronic music from Seoul and beyond.";

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

export default function VideoPage(): ReactElement {
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
        <div className="flex flex-col items-center md:max-w-7xl">
          {/* todo: re-add delay of 0.2seconds */}
          <TextReveal
            as="h1"
            className="leading-wide tracking-relaxed text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl"
          >
            Video
          </TextReveal>

          <FancyLine className={"m-16"} />
          <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden">
            <div className="flex flex-wrap justify-center">
              {musicInfos.map((info, index) => (
                <div key={index} className="relative w-full md:w-[640px]">
                  <YoutubeCard
                    key={index}
                    id={index % 2 === 0 ? "1lAXNqA25Bs" : "bikTSiNr08w"}
                    title={
                      index % 2 === 0
                        ? "JUNTARO - Live from Baccarat, Bangkok"
                        : "DJ 믹스 플레이리스트 - Tech House , Afro house : SIELO | PM MU:SE / MIXMIX"
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
