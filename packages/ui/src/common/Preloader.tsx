"use client";

import React, { useEffect, useState } from "react";
import type { Variants } from "motion/react";
import { motion } from "motion/react";

import { cn } from "@repo/ui";

interface PreloaderProps {
  children: React.ReactNode;
}

export const opacity: Variants = {
  initial: {
    opacity: 0.35,
  },
  enter: {
    opacity: 0.75,
    transition: { duration: 0.35 },
  },
};

export const slideUp: Variants = {
  initial: {
    top: 0,
  },
  exit: {
    top: "-100dvh",
    transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 },
  },
};

export function Preloader({ children }: PreloaderProps) {
  const [dimension, setDimension] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimension({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  const initialPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height + 300} 0 ${dimension.height}  L0 0`;
  const targetPath = `M0 0 L${dimension.width} 0 L${dimension.width} ${dimension.height} Q${dimension.width / 2} ${dimension.height} 0 ${dimension.height}  L0 0`;

  const curve: Variants = {
    initial: {
      d: initialPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] },
    },
    exit: {
      d: targetPath,
      transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1], delay: 0.3 },
    },
  };

  return (
    <motion.div
      variants={slideUp}
      initial="initial"
      exit="exit"
      className="bg-background fixed z-999 flex h-[100dvh] w-[100dvw] cursor-wait items-center justify-center px-[60px] pb-[40px]"
    >
      <motion.div
        variants={opacity}
        initial="initial"
        animate="enter"
        className={cn(
          "text-foreground absolute z-1 flex items-center text-[192px]",
        )}
      >
        {children}
      </motion.div>

      {dimension.width > 0 && (
          <svg className="absolute top-0 h-[calc(100%+300px)] w-full">
            <motion.path
              variants={curve}
              initial="initial"
              exit="exit"
              className={"fill-background"}
            ></motion.path>
          </svg>
      )}
    </motion.div>
  );
}
