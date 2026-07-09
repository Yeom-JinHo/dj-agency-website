"use client";

import type { MotionProps, UseInViewOptions, Variants } from "motion/react";
import type { ReactNode } from "react";
import { useRef } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";

import { useReducedMotionSafe } from "../hooks/useReducedMotionSafe";

type MarginType = UseInViewOptions["margin"];

interface BlurFadeProps extends MotionProps {
  children: ReactNode;
  className?: string;
  variant?: {
    hidden: { y: number };
    visible: { y: number };
  };
  duration?: number;
  delay?: number;
  offset?: number;
  direction?: "up" | "down" | "left" | "right";
  inView?: boolean;
  inViewMargin?: MarginType;
  blur?: string;
}

export function BlurFade({
  children,
  className,
  variant,
  duration = 0.4,
  delay = 0,
  offset = 6,
  direction = "down",
  inView = false,
  inViewMargin = "-50px",
  blur = "6px",
  ...props
}: BlurFadeProps) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const isInView = !inView || inViewResult;
  // prefers-reduced-motion: 이동/블러 엔트런스 없이 즉시 표시.
  const reduceMotion = useReducedMotionSafe();
  const defaultVariants: Variants = {
    hidden: {
      [direction === "left" || direction === "right" ? "x" : "y"]:
        direction === "right" || direction === "down" ? -offset : offset,
      opacity: 0,
      filter: `blur(${blur})`,
    },
    visible: {
      [direction === "left" || direction === "right" ? "x" : "y"]: 0,
      opacity: 1,
      filter: `blur(0px)`,
    },
  };
  const combinedVariants = variant ?? defaultVariants;
  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={reduceMotion ? "visible" : "hidden"}
        animate={reduceMotion || isInView ? "visible" : "hidden"}
        exit="hidden"
        variants={combinedVariants}
        transition={{
          delay: 0.04 + delay,
          duration: reduceMotion ? 0 : duration,
          ease: "easeOut",
        }}
        className={className}
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
