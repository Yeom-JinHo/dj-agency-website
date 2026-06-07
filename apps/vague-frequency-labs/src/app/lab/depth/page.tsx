import type { Metadata } from "next";
import { DreamDive } from "@repo/ui/webgl";

export const metadata: Metadata = {
  title: "Dream Dive Lab",
  robots: { index: false, follow: false },
};

const ARTISTS = ["sam", "dearboi", "sielo", "juntaro", "playmode", "loozbone"];

const SLIDES = ARTISTS.map((name) => ({
  image: `/images/artist/${name}/profile.webp`,
  depth: `/images/lab/${name}-depth.webp`,
}));

export default function DepthLabPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-black">
      <DreamDive
        className="absolute inset-0 h-full w-full"
        slides={SLIDES}
        alt="Dream dive — depth parallax sequence"
        speed={2.2}
        focus={0.5}
        aberration={0.004}
      />
      <p className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 text-xs tracking-[0.35em] text-white/50">
        CLICK &amp; HOLD
      </p>
    </main>
  );
}
