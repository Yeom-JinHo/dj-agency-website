"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

import { SectionHead } from "@/components/SectionHead";

import { workCases } from "./config";

function WorkCard({
  work,
  delayMs,
  reveal,
}: Readonly<{
  work: (typeof workCases)[number];
  delayMs: number;
  reveal: boolean;
}>) {
  // 카드가 각자 자기 진입을 감지 — 컨테이너 공유 관찰자는 모바일 1열
  // 스택(컨테이너 높이 ≫ 뷰포트)에서 리빌이 화면 밖에서 끝나버린다.
  const ref = useRef<HTMLAnchorElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });

  return (
    <a
      ref={ref}
      href="#"
      className={`group relative cursor-pointer ${
        reveal
          ? inView
            ? "animate-hero-fade-in [animation-duration:500ms]"
            : "opacity-0"
          : ""
      } ${work.spanClassName}`}
      // hero-fade-in(both)이 delay 동안 from(opacity 0)을 유지하므로 깜빡임 없음.
      style={reveal && inView ? { animationDelay: `${delayMs}ms` } : undefined}
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
        <h3 className="font-display text-3xl uppercase leading-none tracking-[0.01em] transition-colors duration-300 group-hover:text-ca-red group-active:text-ca-red">
          {work.title}
        </h3>
        <div className="text-right font-mono text-[11px] uppercase tracking-[0.1em] text-ca-muted lg:text-[13px]">
          {work.credit}
          <br />
          {work.date}
        </div>
      </div>
    </a>
  );
}

export default function Work() {
  // SSR·no-JS·reduced-motion에서는 숨김 없이 정적 노출. 리빌(opacity-0)은
  // 마운트 후에만 opt-in해서 서버/클라 마크업을 일치시킨다(hydration mismatch
  // 방지). Work는 fold 아래라 마운트 직후 숨김 전환은 보이지 않는다.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduce = useReducedMotion();
  const reveal = mounted && !reduce;

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
      <div className="grid grid-cols-1 gap-6 px-6 lg:grid-cols-12 lg:px-10">
        {workCases.map((work, i) => (
          // delay는 행 내 좌→우 스태거만(lg 2장/행). 카드별 관찰이라 행 간
          // 리듬은 스크롤 진입 자체가 만든다.
          <WorkCard key={work.id} work={work} delayMs={(i % 2) * 40} reveal={reveal} />
        ))}
      </div>
    </section>
  );
}
