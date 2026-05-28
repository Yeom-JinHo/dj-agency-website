import type { Metadata } from "next";
import Link from "next/link";

import { ScrollScene } from "./_components/ScrollScene";

const SEQ_BG = "#030706";
const FRAME_PATH = "/";
const FRAME_PREFIX = "ezgif-frame-";
const FRAME_EXT = "jpg";
const FRAME_PADDING = 3;
const FRAME_COUNT = 300;

export const metadata: Metadata = {
  title: "SonicWave Pro — Sound Redefined",
  description: "Scrollytelling concept demo for SonicWave Pro premium wireless headphones.",
  robots: { index: false, follow: false },
};

export default function ScrollytellingDemoPage() {
  return (
    <main
      className="min-h-screen font-sans text-white antialiased"
      style={{ backgroundColor: SEQ_BG }}
    >
      <section className="relative flex h-screen flex-col items-center justify-center px-6">
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 md:text-xs">
          Demo · Scrollytelling
        </p>
        <h1 className="mt-6 text-center text-6xl font-medium tracking-tight text-white/90 md:text-8xl">
          SonicWave Pro
        </h1>
        <p className="mt-6 max-w-md text-center text-sm text-white/60 md:text-base">
          Premium wireless headphones, engineered for clarity.
        </p>

        <div className="absolute bottom-10 flex flex-col items-center gap-3 md:bottom-14">
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">
            Scroll to explore
          </span>
          <span
            aria-hidden
            className="block h-10 w-px animate-pulse bg-gradient-to-b from-white/40 to-transparent"
          />
        </div>
      </section>

      <ScrollScene
        frameCount={FRAME_COUNT}
        framePath={FRAME_PATH}
        framePrefix={FRAME_PREFIX}
        frameExt={FRAME_EXT}
        framePadding={FRAME_PADDING}
        bgColor={SEQ_BG}
      />

      <section className="relative flex min-h-screen flex-col items-center justify-center gap-8 px-6 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 md:text-xs">
          Pre-order open
        </p>
        <h2 className="max-w-2xl text-4xl font-medium tracking-tight text-white/90 md:text-6xl">
          Hear what you&rsquo;ve been missing.
        </h2>
        <p className="max-w-md text-sm text-white/60 md:text-base">
          Three finishes. Ships worldwide in five days.
        </p>
        <Link
          href="#"
          className="mt-2 inline-flex h-12 items-center rounded-full bg-white px-8 text-sm font-medium tracking-tight text-black transition hover:bg-white/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60"
        >
          Pre-order — $349
        </Link>
        <p className="absolute bottom-8 text-[10px] uppercase tracking-[0.4em] text-white/30">
          © SonicWave · Concept demo
        </p>
      </section>
    </main>
  );
}
