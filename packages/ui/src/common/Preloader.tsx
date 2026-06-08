"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

import { cn } from "@repo/ui";

interface PreloaderProps {
  children: React.ReactNode;
}

// When (ms, from navigation start) the overlay starts sweeping up. The CSS intro
// (0→100 counter → "Are you ready?") finishes its hand-off and settles before
// this, so the payoff has its moment on screen. Floored on hydration: on a slow
// load the sweep waits for mount (it needs window dimensions), but never fires
// earlier than this.
const SWEEP_AT_MS = 2400;

export function Preloader({ children }: PreloaderProps) {
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const [sweep, setSweep] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
    const remaining = Math.max(0, SWEEP_AT_MS - performance.now());
    const t = setTimeout(() => setSweep(true), remaining);
    return () => clearTimeout(t);
  }, []);

  // Unmount once the slide-up has finished so the off-screen overlay does not
  // linger in the DOM running its infinite breathe (and out of the a11y tree).
  if (dismissed) return null;

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height}  L0 0`;
  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height}  L0 0`;

  // The two-beat intro runs on CSS from the very first paint — before hydration
  // — so there is no frozen black frame. The overlay slide-up and its SVG curve
  // share the same `sweep` clock so the curve stays in sync with the slide. The
  // sweep is keyed on `sweep` (not on `dimension`), so the overlay always
  // dismisses even on a 0-width viewport; only the curve needs real dimensions.
  const hasDimensions = dimension.width > 0;

  return (
    <motion.div
      aria-hidden="true"
      initial={{ y: 0 }}
      animate={sweep ? { y: "-100dvh" } : { y: 0 }}
      transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
      onAnimationComplete={() => {
        if (sweep) setDismissed(true);
      }}
      className="bg-background fixed top-0 left-0 z-999 flex h-[100dvh] w-[100dvw] cursor-wait items-center justify-center px-[60px] pb-[40px]"
    >
      <div
        className={cn(
          "vfl-loader-intro text-foreground absolute z-1 text-6xl font-bold xl:text-[12rem]",
          "font-display",
        )}
      >
        {children}
      </div>

      {hasDimensions && (
        <svg className="absolute top-0 h-[calc(100%+300px)] w-full">
          <motion.path
            initial={{ d: initialPath }}
            animate={sweep ? { d: targetPath } : { d: initialPath }}
            transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
            className="fill-background"
          ></motion.path>
        </svg>
      )}
    </motion.div>
  );
}
