"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";

import NumberTicker from "@repo/ui/common/NumberTicker";

import { stats } from "./config";

const COUNTUP_TRANSITION = {
  duration: 1.6,
  type: "tween" as const,
  ease: [0.22, 1, 0.36, 1] as const,
};

export default function Stats() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const reduce = useReducedMotion();

  return (
    <section
      ref={ref}
      aria-labelledby="stats-heading"
      className="grid grid-cols-2 gap-px border-y border-ca-line bg-ca-line lg:grid-cols-4"
    >
      <h2 id="stats-heading" className="sr-only">
        By the numbers
      </h2>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="group bg-ca-bg px-6 py-10 transition-colors duration-300 hover:bg-ca-bg-hover lg:px-8 lg:py-12"
        >
          <div className="origin-bottom-left font-display text-[64px] leading-none tracking-[-0.01em] transition-transform duration-300 ease-out group-hover:scale-[1.03] lg:text-[88px]">
            {!stat.countUp ? (
              <span>{stat.value}</span>
            ) : reduce ? (
              <span>{parseInt(stat.value, 10)}</span>
            ) : inView ? (
              <NumberTicker
                from={0}
                target={parseInt(stat.value, 10)}
                transition={COUNTUP_TRANSITION}
              />
            ) : (
              <span>0</span>
            )}
            {stat.superscript ? (
              <sup className="ml-1 align-top text-[24px] text-ca-red lg:text-[32px]">
                {stat.superscript}
              </sup>
            ) : null}
          </div>
          <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ca-muted lg:text-[13px]">
            {stat.label}
          </div>
        </div>
      ))}
    </section>
  );
}
