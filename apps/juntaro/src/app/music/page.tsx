import type { Metadata } from "next";

import { BlurFade } from "@repo/ui/common/BlurFade";

import { Footer } from "@/components/footer";
import { MusicCard } from "@/components/music/MusicCard";
import { TRACKS } from "@/consts/tracks";

export const metadata: Metadata = {
  title: "Music — Juntaro",
};

export default function MusicPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      {/* 헤더 내비가 활성 밑줄로 현재 페이지를 이미 지목하므로 제목은 접근성용으로만 둔다. */}
      <h1 className="sr-only">Music</h1>
      <div className="flex flex-1 items-center justify-center px-6 pt-24 pb-16 md:px-10 md:pt-32 lg:px-16">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-10 md:gap-16">
          {TRACKS.map((track) => (
            <BlurFade key={track.id} inView duration={0.6}>
              <MusicCard track={track} />
            </BlurFade>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
