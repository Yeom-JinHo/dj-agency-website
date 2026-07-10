"use client";

import { AnimatePresence, motion } from "motion/react";

import { useClipboard } from "../hooks/useClipboard";
import { useReducedMotionSafe } from "../hooks/useReducedMotionSafe";

import { cn } from "../index";

export default function CopyButton({
  className,
  text,
}: {
  className: string;
  text: string;
}) {
  const { copy, copied } = useClipboard();
  // prefers-reduced-motion: scale 전환 없이 opacity 페이드만 남긴다.
  const reduceMotion = useReducedMotionSafe();
  const hiddenScale = reduceMotion ? 1 : 0.7;
  const hiddenScaleSubtle = reduceMotion ? 1 : 0.85;

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
      className={cn(
        "relative inline-flex h-9 min-w-[88px] items-center justify-center gap-1.5 rounded-md px-2.5 text-white/55 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none active:scale-95 motion-reduce:active:scale-100",
        className,
      )}
    >
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
      <AnimatePresence initial={false} mode="wait">
        {copied ? (
          <motion.span
            key="check"
            className="inline-flex items-center gap-1.5 text-[#FFBE7B]"
            initial={{ opacity: 0, scale: hiddenScale }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: hiddenScale }}
            transition={{ duration: 0.18 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
            <span className="text-[11px] font-medium tracking-wider uppercase">
              Copied
            </span>
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            className="inline-flex items-center gap-1.5"
            initial={{ opacity: 0, scale: hiddenScaleSubtle }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: hiddenScaleSubtle }}
            transition={{ duration: 0.18 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden
            >
              <rect x="9" y="9" width="11" height="11" rx="2" />
              <path d="M5 15V5a2 2 0 0 1 2-2h10" />
            </svg>
            <span className="text-[11px] font-medium tracking-wider uppercase">
              Copy
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
