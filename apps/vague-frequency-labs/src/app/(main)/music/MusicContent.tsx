import type { ReactElement } from "react";
import React from "react";
import { musicInfo } from "@/source";
import { BlurFade } from "@repo/ui/common/BlurFade";
import FancyLine from "@repo/ui/common/FancyLine";
import SectionHeading from "@/components/SectionHeading";
import MusicInfoCard from "../../sections/musicList/MusicInfoCard";

export default function MusicContent(): ReactElement {
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
      <section
        className="relative flex min-h-[calc(50dvh)] items-center justify-center"
        id="hero"
      >
        <div className="flex flex-col items-center md:max-w-7xl">
          <SectionHeading as="h1" variant="page">
            Music
          </SectionHeading>

          <FancyLine className={"m-16"} />
          <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden">
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 px-5 sm:px-6 md:gap-16 md:px-0">
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
