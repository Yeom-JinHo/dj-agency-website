"use client";

import { motion, MotionConfig } from "motion/react";
import { WorldMap } from "@/components/WorldMap";
import { hero } from "./config";

const EASE = [0.22, 1, 0.36, 1] as const;

function Hero() {
  // Staggered rise so the headline reads in order — eyebrow, brand, subline —
  // instead of arriving as one flat block. Mount-driven only (no loader delay).
  const rise = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.65, ease: EASE, delay },
  });

  return (
    <MotionConfig reducedMotion="user">
      <section className="vfl-hero relative h-[100svh] overflow-hidden">
        {/* Start the hero motion on mount so it always draws in, but never waits
            on a client timer or loader-driven delay. */}
        <div className="vfl-map-wrap">
          <WorldMap cities={hero.cities} homeId={hero.homeId} revealDelay={0} />
        </div>

        <div className="vfl-vignette" aria-hidden />
        <div className="vfl-grain" aria-hidden />

        {/* Headline brackets the map: on mobile the outlined "ENTERTAINMENT"
            kicker sits above the map band and the brand name below it; on
            desktop both stack bottom-left. */}
        <div className="vfl-headline">
          {/* Eyebrow: the category kicker carries the outline cut so the brand
              name below stays the solid, high-contrast lead. */}
          <motion.span {...rise(0)} className="vfl-h-eyebrow">
            {hero.eyebrow}
          </motion.span>
          <div className="vfl-h-bottom">
            <motion.h1 {...rise(0.08)} className="vfl-h-big vfl-h-brand">
              {hero.headline.split(" ").map((word, i, arr) => (
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

        {/* Scroll wayfinding — bottom-center, clear of the bottom-left headline. */}
        <motion.div
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
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
