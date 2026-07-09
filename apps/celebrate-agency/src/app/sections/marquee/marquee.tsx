import type { CSSProperties } from "react";

import { ARTISTS } from "@/consts/artists";

// Each set must exceed viewport width so the -50% translate (= one set)
// always lands on filled track. 2x ARTISTS covers up to ~4K displays.
const REPEATS_PER_SET = 2;

const SET = Array.from({ length: REPEATS_PER_SET }).flatMap(() =>
  ARTISTS.map((artist) => artist.name)
);

export default function Marquee() {
  const loop = [...SET, ...SET];
  return (
    <div
      aria-hidden="true"
      className="group mt-10 overflow-hidden border-y border-ca-line bg-ca-bg py-5 lg:mt-[60px] lg:py-6"
    >
      {/* hover 일시정지: 이름을 읽을 틈을 준다. play-state 토글이라 컴포지터
          애니메이션 유지 — 트랙 재배치 없음. */}
      <div
        className="flex w-max animate-marquee whitespace-nowrap group-hover:[animation-play-state:paused]"
        // Duration = per-artist base (responsive, from CSS) × artist count, so
        // px/s stays constant as the roster grows. Resolved on the element so
        // the inherited --marquee-base picks up the breakpoint value.
        style={
          { animationDuration: `calc(var(--marquee-base) * ${ARTISTS.length})` } as CSSProperties
        }
      >
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-[60px] pr-[60px] font-display text-4xl uppercase tracking-[0.02em] lg:text-5xl"
          >
            {item}
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-ca-red" />
          </span>
        ))}
      </div>
    </div>
  );
}
