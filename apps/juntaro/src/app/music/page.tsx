import type { Metadata } from "next";
import type { JuntaroTrack } from "@/types/music";

import { BlurFade } from "@repo/ui/common/BlurFade";

import { Footer } from "@/components/footer";
import { MusicCard } from "@/components/music/MusicCard";
import { TRACKS } from "@/consts/tracks";

export const metadata: Metadata = {
  title: "Music — Juntaro",
};

// 카드별 리듬 값 (인덱스 기반, deterministic). VFL MusicList의 10칸 배열에서 5개 슬라이스.
const ROTS = [-3, 2.5, -2, 3, -2.5];
const DYS = [0, 40, 14, 46, 24];

interface CollageCard {
  track: JuntaroTrack;
  rot: number;
  dy: number;
  z: number;
}

const collageCards: CollageCard[] = TRACKS.map((track, i) => ({
  track,
  rot: ROTS[i % ROTS.length]!,
  dy: DYS[i % DYS.length]!,
  z: 2 + ((i * 5) % 6),
}));

export default function MusicPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      {/* 헤더 내비가 활성 밑줄로 현재 페이지를 이미 지목하므로 제목은 접근성용으로만 둔다. */}
      <h1 className="sr-only">Music</h1>
      <div className="flex flex-1 items-center justify-center px-6 pt-24 pb-16 md:px-10 md:pt-32 lg:px-16">
        {/* 데스크톱: overlapping collage */}
        <div className="hidden w-full justify-center lg:flex">
          <div className="flex max-w-[940px] flex-wrap items-start justify-center xl:max-w-[1140px]">
            {collageCards.map((c) => (
              <div
                key={c.track.id}
                className="relative transition-transform duration-300 ease-out hover:!z-[60] hover:!rotate-0 hover:scale-[1.05] motion-reduce:transition-none"
                style={{
                  margin: "0 -28px -26px",
                  marginTop: c.dy,
                  zIndex: c.z,
                  transform: `rotate(${c.rot}deg)`,
                }}
              >
                <BlurFade inView duration={0.6}>
                  <MusicCard
                    track={c.track}
                    cardClassName="h-[228px] w-[228px] shadow-[0_24px_60px_rgba(0,0,0,0.18)] outline outline-1 outline-[#111111]/10 xl:h-[272px] xl:w-[272px]"
                  />
                </BlurFade>
              </div>
            ))}
          </div>
        </div>

        {/* 모바일: 미니 collage */}
        <div className="flex w-full justify-center lg:hidden">
          <div className="flex max-w-[380px] flex-wrap items-start justify-center sm:max-w-[440px]">
            {collageCards.map((c) => (
              <div
                key={c.track.id}
                className="relative transition-transform duration-300 ease-out active:!z-[60] active:!rotate-0 active:scale-[1.05] motion-reduce:transition-none"
                style={{
                  margin: "0 -12px -14px",
                  marginTop: Math.round(c.dy * 0.5),
                  zIndex: c.z,
                  transform: `rotate(${c.rot}deg)`,
                }}
              >
                <BlurFade inView duration={0.6}>
                  <MusicCard
                    track={c.track}
                    cardClassName="h-[172px] w-[172px] shadow-[0_18px_40px_rgba(0,0,0,0.16)] outline outline-1 outline-[#111111]/10 sm:h-[196px] sm:w-[196px]"
                  />
                </BlurFade>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
