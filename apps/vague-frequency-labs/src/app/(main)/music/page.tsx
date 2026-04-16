"use client";

import React from "react";
import { musicInfo } from "@/source";
import { BlurFade } from "@repo/ui/common/BlurFade";
import FancyLine from "@repo/ui/common/FancyLine";
import TextReveal from "@repo/ui/common/TextReveal";
import MusicInfoCard from "../../sections/musicList/MusicInfoCard";

// TODO: 수정필요
// export const metadata = createMetadata({
//   title,
//   description,
//   openGraph: {
//     url: "/music",
//     title,
//     description,
//   },
//   twitter: {
//     title,
//     description,
//   },
// });

// const jsonLd: WithContext<CollectionPage> = {
//   "@context": "https://schema.org",
//   "@type": "CollectionPage",
//   name: title,
//   description,
//   url: `${meta.site.url}/music`,
//   isPartOf: {
//     "@type": "WebSite",
//     name: meta.site.title,
//     url: meta.site.url,
//   },
//   hasPart: [...project.getPages()].map((project) => ({
//     "@type": "SoftwareApplication",
//     name: project.data.title,
//     description: project.data.description,
//     url: project.url,
//     applicationCategory: "WebApplication",
//   })),
// };

import type { ReactElement } from "react";

export default function MusicPage(): ReactElement {
  const musicInfos = [
    ...musicInfo.getInfos(),
    ...musicInfo.getInfos(),
    ...musicInfo.getInfos(),
    ...musicInfo.getInfos(),
    ...musicInfo.getInfos(),
    ...musicInfo.getInfos(),
    ...musicInfo.getInfos(),
    ...musicInfo.getInfos(),
    ...musicInfo.getInfos(),
  ];

  return (
    <main className="my-16 flex-1">
      {/* <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      /> */}
      <section
        className="relative flex min-h-[calc(50dvh)] items-center justify-center"
        id="hero"
      >
        <div className="flex flex-col items-center md:max-w-7xl">
          {/* todo: re-add delay of 0.2seconds */}
          <TextReveal
            as="h1"
            className="leading-wide tracking-relaxed text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl"
          >
            Music
          </TextReveal>

          <FancyLine className={"m-16"} />
          <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden">
            <div className="flex flex-wrap justify-center gap-16">
              {musicInfos.map((info, index) => (
                <BlurFade key={info.name + index} inView duration={0.6}>
                  <MusicInfoCard musicInfo={info} />
                </BlurFade>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
