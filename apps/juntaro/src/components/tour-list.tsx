import type { CSSProperties } from "react";

import { TOUR_DATES } from "@/consts/tours";

export function TourList() {
  return (
    <div className="px-6 pb-10 md:px-10 md:pb-14">
      {/* 데이터는 현재 2026 단일 연대이므로 그룹핑 없이 첫 항목 연도를 그대로 디바이더로 쓴다. */}
      {/* 캡션이 이 페이지의 실제 정보라 푸터의 장식용 /55보다 한 단계 진하게 + medium (WCAG AA 4.5:1 확보) */}
      <p className="mb-6 font-mono text-[11px] font-medium tracking-[0.3em] text-[#111111]/70 uppercase md:mb-8">
        {TOUR_DATES[0].year}
      </p>

      <ul className="group/rows">
        {TOUR_DATES.map((tour, i) => (
          <li
            key={`${tour.city}-${tour.dateLabel}`}
            // hover는 감각 피드백만 — 링크 어휘(밑줄·커서) 금지. 형제 row 딤은 field 급이라 200ms 대신 300ms
            className="group flex flex-col gap-1 py-4 first:pt-0 md:flex-row md:items-end md:gap-6 md:py-6 animate-tour-reveal transition-opacity duration-300 ease-out group-hover/rows:opacity-40 hover:opacity-100 motion-reduce:animate-none motion-reduce:transition-none"
            style={{ animationDelay: `${i * 70}ms` } as CSSProperties}
          >
            <p className="shrink-0 font-mono text-[11px] font-medium tracking-[0.3em] text-[#111111]/70 uppercase transition-colors duration-200 ease-out group-hover:text-[#111111]/90 motion-reduce:transition-none">
              {tour.dateLabel}
            </p>

            <div className="flex flex-1 items-start gap-2 md:gap-3">
              {/* 도시명이 포스터의 주인공 — 모달 트랙 타이틀과 같은 display(Anton)로 헤드라인 서체를 통일한다 */}
              <h2 className="font-display text-[clamp(2rem,7vw,6rem)] leading-[0.9] tracking-[0.01em] text-[#111111] uppercase whitespace-nowrap">
                {tour.city}
              </h2>
              <span className="font-mono text-[11px] leading-none font-medium tracking-[0.3em] text-[#111111]/70 uppercase transition-colors duration-200 ease-out group-hover:text-[#111111]/90 motion-reduce:transition-none">
                {tour.country}
              </span>
            </div>

            {/* 베뉴는 정보 페이로드 — 날짜(/70)보다 한 단계 더 진하게 위계 유지 */}
            <p className="shrink-0 font-mono text-[11px] font-medium tracking-[0.3em] text-[#111111]/80 uppercase md:text-right transition-colors duration-200 ease-out group-hover:text-[#111111]/95 motion-reduce:transition-none">
              — {tour.venue}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
