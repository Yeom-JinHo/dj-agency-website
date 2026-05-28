"use client";

import { AnimatePresence, motion } from "motion/react";

import { useClipboard } from "../hooks/useClipboard";

import { cn } from "../index";

export default function CopyButton({
  className,
  text,
}: {
  className: string;
  text: string;
}) {
  const { copy, copied } = useClipboard();

  return (
    <button
      type="button"
      onClick={() => copy(text)}
      aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-md text-white/55 transition-colors duration-200 hover:text-white focus-visible:text-white focus-visible:outline-none active:scale-95",
        className,
      )}
    >
      <span aria-live="polite" className="sr-only">
        {copied ? "Copied" : ""}
      </span>
      <AnimatePresence initial={false} mode="wait">
        {copied ? (
          <motion.svg
            key="check"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-[#FFBE7B]"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.18 }}
            aria-hidden
          >
            <path d="M5 12l5 5L20 7" />
          </motion.svg>
        ) : (
          <motion.svg
            key="copy"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ duration: 0.18 }}
            aria-hidden
          >
            <rect x="9" y="9" width="11" height="11" rx="2" />
            <path d="M5 15V5a2 2 0 0 1 2-2h10" />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}
