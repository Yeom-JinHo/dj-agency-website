import type { Metadata } from "next";

import { Footer } from "@/components/footer";
import { TourList } from "@/components/tour-list";

export const metadata: Metadata = {
  title: "Tour — Juntaro",
  description: "Upcoming Juntaro tour dates and live DJ sets.",
  alternates: { canonical: "/tour" },
  openGraph: { url: "/tour" },
};

export default function TourPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      {/* 헤더 내비가 활성 밑줄로 현재 페이지를 이미 지목하므로 제목은 접근성용으로만 둔다. */}
      <h1 className="sr-only">Tour</h1>
      {/* fixed 우상단 헤더를 pt-28/36으로 클리어, flex-1이 콘텐츠가 짧아도 Footer를 하단에 고정한다. */}
      <div className="flex-1 pt-28 md:pt-36">
        <TourList />
      </div>
      <Footer />
    </main>
  );
}
