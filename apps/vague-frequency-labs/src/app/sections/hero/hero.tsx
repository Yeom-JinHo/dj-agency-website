"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { WorldMap } from "@/components/WorldMap";
import { hero } from "./config";

const EASE = [0.22, 1, 0.36, 1] as const;

// The map is decoupled from the loader: it renders immediately and the loader
// (z-999) simply covers it until it lifts, so the map can never be "late" —
// there is no timer gating its visibility. Only the secondary entrance (arcs
// draw-in, headline stagger) syncs to the loader lift via this event, with a
// wall-clock backup for pages/loads where the event never arrives.
const INTRO_DONE_EVENT = "vfl:intro-complete";
const REVEAL_BACKUP = 3000;

function Hero() {
  const reduce = useReducedMotion();
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (reduce) {
      setRevealed(true);
      return;
    }
    let done = false;
    const reveal = () => {
      if (!done) {
        done = true;
        setRevealed(true);
      }
    };
    // Primary trigger: the loader broadcasts when it lifts.
    window.addEventListener(INTRO_DONE_EVENT, reveal);
    // Backup: wall-clock (survives background tabs) + visibilitychange catch-up,
    // in case the loader is absent or its event was missed.
    const start = Date.now();
    const t = setTimeout(reveal, REVEAL_BACKUP);
    const onVisible = () => {
      if (!document.hidden && Date.now() - start >= REVEAL_BACKUP) reveal();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener(INTRO_DONE_EVENT, reveal);
      clearTimeout(t);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [reduce]);

  // Secondary entrance stagger, played once the loader lifts (or backup fires).
  const rise = (delay: number) =>
    reduce
      ? { initial: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 20 },
          animate: revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <section className="vfl-hero relative h-[100svh] overflow-hidden">
      {/* Rendered immediately — never gated on a timer. The arcs' draw-in is the
          only part synced to the loader lift (via `play`). */}
      <div className="vfl-map-wrap">
        <WorldMap
          cities={hero.cities}
          homeId={hero.homeId}
          revealDelay={0.15}
          play={revealed}
        />
      </div>

      <div className="vfl-vignette" aria-hidden />
      <div className="vfl-grain" aria-hidden />

      {/* Headline brackets the map: on mobile "We are" sits above the map band
          and the brand name below it; on desktop both stack bottom-left. */}
      <div className="vfl-headline">
        <motion.span {...rise(0.4)} className="vfl-h-big vfl-h-intro">
          {hero.headline.line1}
        </motion.span>
        <div className="vfl-h-bottom">
          <motion.h1 {...rise(0.45)} className="vfl-h-big vfl-h-brand">
            {hero.headline.line2.split(" ").map((word, i, arr) => (
              <span key={word} className="stroke vfl-h-word">
                {word}
                {i < arr.length - 1 ? " " : ""}
              </span>
            ))}
          </motion.h1>
          <motion.div {...rise(0.55)} className="vfl-h-en">
            {hero.subline}
          </motion.div>
        </div>
      </div>

      {/* Scroll wayfinding — bottom-center, clear of the bottom-left headline. */}
      <motion.div
        aria-hidden
        initial={reduce ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: revealed || reduce ? 1 : 0 }}
        transition={
          reduce ? undefined : { duration: 0.6, delay: revealed ? 1.1 : 0 }
        }
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
