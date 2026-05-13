import { ARTISTS } from "@/consts/artists";

// Each set must exceed viewport width so the -50% translate (= one set)
// always lands on filled track. Sized for 4K+ ultrawide displays.
const REPEATS_PER_SET = 6;

const SET = Array.from({ length: REPEATS_PER_SET }).flatMap(() =>
  ARTISTS.map((artist) => artist.name)
);

export default function Marquee() {
  const loop = [...SET, ...SET];
  return (
    <div
      aria-hidden="true"
      className="mt-10 overflow-hidden border-y border-ca-line bg-ca-bg py-5 lg:mt-[60px] lg:py-6"
    >
      <div className="flex w-max animate-marquee whitespace-nowrap">
        {loop.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-[60px] pr-[60px] font-display text-5xl uppercase tracking-[0.02em]"
          >
            {item}
            <span className="inline-block h-2.5 w-2.5 rounded-full bg-ca-red" />
          </span>
        ))}
      </div>
    </div>
  );
}
