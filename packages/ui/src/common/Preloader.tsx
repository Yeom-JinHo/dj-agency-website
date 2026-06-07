"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";

import { cn } from "@repo/ui";

interface PreloaderProps {
  children: React.ReactNode;
}

// Hold the intro briefly after mount, then sweep the overlay up.
const HOLD = 0.3;

export function Preloader({ children }: PreloaderProps) {
  const [dimension, setDimension] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
    setMounted(true);
  }, []);

  // Unmount once the slide-up has finished so the off-screen overlay does not
  // linger in the DOM running its infinite breathe (and out of the a11y tree).
  if (dismissed) return null;

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height}  L0 0`;
  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height}  L0 0`;

  // The visible intro (text fade + breathe) runs on CSS from the very first
  // paint — before hydration — so there is no frozen black frame. The slide-up
  // is keyed on `mounted` (not on `dimension`), so the overlay always dismisses
  // even on a 0-width viewport; the SVG curve is the only piece that needs real
  // dimensions, and it rides the same motion clock to stay in sync.
  const hasDimensions = dimension.width > 0;

  return (
    <motion.div
      aria-hidden="true"
      initial={{ y: 0 }}
      animate={mounted ? { y: "-100dvh" } : { y: 0 }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: HOLD }}
      onAnimationComplete={() => {
        if (mounted) setDismissed(true);
      }}
      className="bg-background fixed top-0 left-0 z-999 flex h-[100dvh] w-[100dvw] cursor-wait items-center justify-center px-[60px] pb-[40px]"
    >
      <div
        className={cn(
          "vfl-loader-intro text-foreground absolute z-1 flex items-center text-6xl font-bold xl:text-[12rem]",
          "font-display",
        )}
      >
        {children}
      </div>

      {hasDimensions && (
        <svg className="absolute top-0 h-[calc(100%+300px)] w-full">
          <motion.path
            initial={{ d: initialPath }}
            animate={{ d: targetPath }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: HOLD }}
            className="fill-background"
          ></motion.path>
        </svg>
      )}
    </motion.div>
  );
}
