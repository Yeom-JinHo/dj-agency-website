import type { Metadata } from "next";

import { getTours } from "@repo/content/queries";
import type { Tour } from "@repo/content/schema";

import { Footer } from "@/components/footer";
import { TourList } from "@/components/tour-list";
import type { TourRow } from "@/components/tour-list";

export const metadata: Metadata = {
  title: "Tour — Juntaro",
};

/**
 * event_date(timestamptz)를 KST 고정으로 표시 문자열로 파생한다. 시드가 넣은 임의
 * 20:00 시각은 노출하지 않고, 월 약어 대문자 + 일("MAR 14")·연도만 취한다. Asia/Seoul
 * 고정이라 뷰어 로케일/타임존과 무관하게 결정적(hydration 안전).
 */
const KST_PARTS = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Seoul",
  month: "short",
  day: "2-digit",
  year: "numeric",
});

function toTourRow(tour: Tour): TourRow {
  const parts = KST_PARTS.formatToParts(new Date(tour.eventDate));
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return {
    dateLabel: `${part("month").toUpperCase()} ${part("day")}`,
    year: part("year"),
    city: tour.city ?? "",
    country: tour.country ?? "",
    venue: tour.venue ?? "",
  };
}

export default async function TourPage() {
  const tours = (await getTours("juntaro")).map(toTourRow);

  return (
    <main className="flex min-h-dvh flex-col">
      {/* 헤더 내비가 활성 밑줄로 현재 페이지를 이미 지목하므로 제목은 접근성용으로만 둔다. */}
      <h1 className="sr-only">Tour</h1>
      {/* fixed 우상단 헤더를 pt-28/36으로 클리어, flex-1이 콘텐츠가 짧아도 Footer를 하단에 고정한다. */}
      <div className="flex-1 pt-28 md:pt-36">
        <TourList tours={tours} />
      </div>
      <Footer />
    </main>
  );
}
