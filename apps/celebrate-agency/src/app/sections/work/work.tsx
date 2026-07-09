"use client";

import { useRef } from "react";
import { useInView, useReducedMotion } from "motion/react";

import { SectionHead } from "@/components/SectionHead";

import { workCases } from "./config";

export default function Work() {
  const gridRef = useRef<HTMLDivElement>(null);
  const inView = useInView(gridRef, { once: true, amount: 0.2 });
  // 진입 리빌은 JS 의존이라 reduce 시엔 숨김 없이 정적 노출로 폴백
  const reveal = !useReducedMotion();

  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="border-t border-ca-line py-20 lg:py-[120px]"
    >
      <SectionHead
        num="02"
        numLabel="SELECTED WORK"
        title="Work"
        headingId="work-heading"
        aside={
          <>
            Last 12 months.
            <br />
            Archive on request.
          </>
        }
      />
      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-6 px-6 lg:grid-cols-12 lg:px-10"
      >
        {workCases.map((work, i) => (
          <a
            key={work.id}
            href="#"
            className={`group relative cursor-pointer ${
              reveal
                ? inView
                  ? "animate-hero-fade-in [animation-duration:500ms]"
                  : "opacity-0"
                : ""
            } ${work.spanClassName}`}
            // hero-fade-in(both)이 delay 동안 from(opacity 0)을 유지하므로 깜빡임 없음.
            // 40ms 간격 — 스티치 12ms처럼 "거의 동시, 리듬만" 수준으로 억제.
            style={
              reveal && inView ? { animationDelay: `${i * 40}ms` } : undefined
            }
          >
            <div
              className={`ca-stripe-ph-lg relative overflow-hidden border border-ca-line transition-[filter,border-color] duration-300 group-hover:border-ca-red/40 group-hover:brightness-125 group-active:border-ca-red/40 group-active:brightness-125 ${work.aspectClassName}`}
            >
              <span className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ca-muted lg:text-[11px]">
                {work.label}
              </span>
              <span className="absolute top-4 right-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ca-fg lg:text-[11px]">
                {work.tag}
              </span>
            </div>
            <div className="flex items-end justify-between pt-4">
              <h3 className="relative font-display text-3xl uppercase leading-none tracking-[0.01em] transition-colors duration-300 group-hover:text-ca-red group-active:text-ca-red">
                {work.title}
                {/* hero 스티치의 hover 확장: 제목이 붉어지는 것과 같은 박자에
                    아래에서 콱 박힌다. 좌하 방향 진입(--sx/--sy)에 미세 틸트로
                    손바느질 느낌 유지. */}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-2 left-0 h-[3px] w-7 -rotate-2 rounded-[1px] bg-ca-red opacity-0 [--sx:-8px] [--sy:4px] group-hover:animate-ca-stitch-stab group-hover:opacity-100 group-active:animate-ca-stitch-stab group-active:opacity-100"
                />
              </h3>
              <div className="text-right font-mono text-[11px] uppercase tracking-[0.1em] text-ca-muted lg:text-[13px]">
                {work.credit}
                <br />
                {work.date}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
