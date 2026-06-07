"use client";

import { motion, useReducedMotion } from "motion/react";
import { WorldMap } from "@/components/WorldMap";
import { hero } from "./config";

const EASE = [0.22, 1, 0.36, 1] as const;

function Hero() {
  const reduce = useReducedMotion();

  // The loader covers the hero for ~3s on load, so the entrance is delayed to
  // start as the loader lifts rather than being consumed behind it.
  const rise = (delay: number) =>
    reduce
      ? { initial: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <section className="vfl-hero relative h-[100svh] overflow-hidden">
      <motion.div
        className="vfl-map-wrap"
        initial={reduce ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduce ? undefined : { duration: 1.1, delay: 2.2 }}
      >
        <WorldMap
          cities={hero.cities}
          homeId={hero.homeId}
          revealDelay={2.4}
        />
      </motion.div>

      <div className="vfl-vignette" aria-hidden />
      <div className="vfl-grain" aria-hidden />

      {/* Headline brackets the map: on mobile "We are" sits above the map band
          and the brand name below it; on desktop both stack bottom-left. */}
      <div className="vfl-headline">
        <motion.span {...rise(2.6)} className="vfl-h-big vfl-h-intro">
          {hero.headline.line1}
        </motion.span>
        <div className="vfl-h-bottom">
          <motion.h1 {...rise(2.65)} className="vfl-h-big vfl-h-brand">
            {hero.headline.line2.split(" ").map((word, i, arr) => (
              <span key={word} className="stroke vfl-h-word">
                {word}
                {i < arr.length - 1 ? " " : ""}
              </span>
            ))}
          </motion.h1>
          <motion.div {...rise(2.75)} className="vfl-h-en">
            {hero.subline}
          </motion.div>
        </div>
      </div>

      {/* Scroll wayfinding — bottom-center, clear of the bottom-left headline. */}
      <motion.div
        aria-hidden
        initial={reduce ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduce ? undefined : { duration: 0.6, delay: 3.3 }}
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
          animate={reduce ? undefined : { y: [0, 6, 0] }}
          transition={
            reduce
              ? undefined
              : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <path d="m6 9 6 6 6-6" />
        </motion.svg>
      </motion.div>
    </section>
  );
}

export default Hero;
