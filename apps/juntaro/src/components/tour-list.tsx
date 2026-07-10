import type { CSSProperties } from "react";

import { TOUR_DATES } from "@/consts/tours";

export function TourList() {
  return (
    <div className="px-6 pb-10 md:px-10 md:pb-14">
      {/* 데이터는 현재 2026 단일 연대이므로 그룹핑 없이 첫 항목 연도를 그대로 디바이더로 쓴다. */}
      <p className="mb-6 font-mono text-[11px] tracking-[0.3em] text-[#111111]/55 uppercase md:mb-8">
        {TOUR_DATES[0].year}
      </p>

      {TOUR_DATES.map((tour, i) => (
        <div
          key={`${tour.city}-${tour.dateLabel}`}
          className="flex flex-col gap-1 py-4 first:pt-0 md:flex-row md:items-end md:gap-6 md:py-6 animate-tour-reveal motion-reduce:animate-none"
          style={{ animationDelay: `${i * 70}ms` } as CSSProperties}
        >
          <p className="shrink-0 font-mono text-[11px] tracking-[0.3em] text-[#111111]/55 uppercase">
            {tour.dateLabel}
          </p>

          <div className="flex flex-1 items-start gap-2 md:gap-3">
            {/* 도시명이 포스터의 주인공 — 캡션용 0.3em 자간을 그대로 쓰면 대형에서 파탄나므로 별도 조정 */}
            <h2 className="text-[clamp(2rem,7vw,6rem)] leading-[0.9] font-mono tracking-[-0.01em] text-[#111111] uppercase whitespace-nowrap">
              {tour.city}
            </h2>
            <span className="font-mono text-[11px] leading-none tracking-[0.3em] text-[#111111]/55 uppercase">
              {tour.country}
            </span>
          </div>

          <p className="shrink-0 font-mono text-[11px] tracking-[0.3em] text-[#111111]/70 uppercase md:text-right">
            — {tour.venue}
          </p>
        </div>
      ))}
    </div>
  );
}
