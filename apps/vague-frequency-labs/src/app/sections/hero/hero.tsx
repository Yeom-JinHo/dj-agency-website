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
        <WorldMap cities={hero.cities} homeId={hero.homeId} />
      </motion.div>

      <div className="vfl-vignette" aria-hidden />
      <div className="vfl-grain" aria-hidden />

      <div className="vfl-headline">
        <motion.h1 {...rise(2.6)} className="vfl-h-big">
          {hero.headline.line1}
          <br />
          <span className="stroke">{hero.headline.line2}</span>
        </motion.h1>
        <motion.div {...rise(2.75)} className="vfl-h-en">
          {hero.subline}
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;
