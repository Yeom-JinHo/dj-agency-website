"use client";

import type { ElementType } from "react";
import { useRef } from "react";
import { motion, useInView } from "motion/react";

import { useReducedMotionSafe } from "../hooks/useReducedMotionSafe";

interface RevealProps {
  phrases: string[];
  className?: string;
  as?: ElementType;
}

export function Reveal({ phrases, className = "", as = "div" }: RevealProps) {
  const body = useRef(null);
  const isInView = useInView(body, { once: true, margin: "0px" });
  // prefers-reduced-motion: 단어별 y-슬라이드 없이 즉시 표시.
  const reduceMotion = useReducedMotionSafe();

  const Tag = as;

  if (reduceMotion) {
    return (
      <Tag ref={body} className={className}>
        {phrases.map((phrase, index) => (
          <span key={index} className="relative mr-1 inline-flex w-fit">
            {phrase}
          </span>
        ))}
      </Tag>
    );
  }

  return (
    <Tag ref={body} className={className}>
      {phrases.map((phrase, index) => (
        <span
          key={index}
          className="relative mr-1 inline-flex w-fit overflow-hidden"
        >
          <motion.span
            className="inline-block"
            custom={index}
            initial={{ y: "100%", opacity: 0 }}
            animate={
              isInView
                ? {
                    y: "0",
                    opacity: 1,
                    transition: {
                      duration: 0.5,
                      ease: [0.33, 1, 0.68, 1] as [
                        number,
                        number,
                        number,
                        number,
                      ],
                      delay: 0.05 * index,
                    },
                  }
                : { y: "100%", opacity: 0 }
            }
          >
            {phrase}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}
