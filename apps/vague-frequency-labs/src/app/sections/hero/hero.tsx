"use client";

import { motion, MotionConfig } from "motion/react";
import { WorldMap } from "@/components/WorldMap";
import { useLoaderDone } from "@/app/(main)/loader-context";
import { hero } from "./config";

const EASE = [0.22, 1, 0.36, 1] as const;

function Hero() {
  // Gated on the loader's landing signal (useLoaderDone) rather than a client
  // timer: LoaderProvider's unconditional watchdog guarantees `done` fires
  // even if the dot-scatter scene fails, so this never hangs (fail-open).
  const done = useLoaderDone();

  // Staggered rise so the headline reads in order — eyebrow, brand, subline —
  // instead of arriving as one flat block. Held at `initial` until the loader
  // lands, then plays with the existing stagger delays.
  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: done ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
    transition: { duration: 0.65, ease: EASE, delay },
  });

  return (
    <MotionConfig reducedMotion="user">
      <section className="vfl-hero relative h-[100svh] overflow-hidden">
        {/* The map mounts immediately (its .vfl-map-inner rect is measured by
            the loader's dot-scatter scene while it's still running) but stays
            visually gated — revealed only once the loader signals `done` —
            so the landing dots crossfade into it instead of popping in early. */}
        <div className="vfl-map-wrap">
          <WorldMap
            cities={hero.cities}
            homeId={hero.homeId}
            revealed={done}
            mapRevealDelay={0}
            revealDelay={0.2}
          />
        </div>

        <div className="vfl-vignette" aria-hidden />
        <div className="vfl-grain" aria-hidden />

        {/* Headline brackets the map: on mobile "We are" sits above the map band
            and the brand name below it; on desktop both stack bottom-left. */}
        <div className="vfl-headline">
          {/* Eyebrow: the connective phrase plays the supporting role — small and
              outline-cut — so the brand name below can be the solid lead. */}
          <motion.span {...rise(0)} className="vfl-h-eyebrow">
            {hero.headline.line1}
          </motion.span>
          <div className="vfl-h-bottom">
            <motion.h1 {...rise(0.08)} className="vfl-h-big vfl-h-brand">
              {hero.headline.line2.split(" ").map((word, i, arr) => (
                <span key={word} className="vfl-h-word">
                  {word}
                  {i < arr.length - 1 ? " " : ""}
                </span>
              ))}
            </motion.h1>
            <motion.div {...rise(0.16)} className="vfl-h-en">
              {hero.subline}
            </motion.div>
          </div>
        </div>

        {/* Scroll wayfinding — bottom-center, clear of the bottom-left headline.
            Same loader-gated reveal as the headline above. */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: done ? 1 : 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.5 }}
          className="pointer-events-none absolute inset-x-0 bottom-6 z-[5] flex flex-col items-center gap-2 [color:var(--vfl-cream)]"
        >
          <span className="hidden font-mono text-[10px] tracking-[0.34em] opacity-55 sm:block">
            SCROLL
          </span>
          <motion.svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 opacity-70"
            animate={{ y: [0, 6, 0] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <path d="m6 9 6 6 6-6" />
          </motion.svg>
        </motion.div>
      </section>
    </MotionConfig>
  );
}

export default Hero;
