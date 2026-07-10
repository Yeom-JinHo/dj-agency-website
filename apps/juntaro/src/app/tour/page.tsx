import type { Metadata } from "next";

import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Tour — Juntaro",
};

export default function TourPage() {
  return (
    <main className="flex min-h-dvh flex-col">
      {/* 헤더 내비가 활성 밑줄로 현재 페이지를 이미 지목하므로 제목은 접근성용으로만 둔다. */}
      <h1 className="sr-only">Tour</h1>
      <div className="flex flex-1 items-center justify-center">
        <p className="font-mono text-[11px] tracking-[0.3em] text-[#111111]/55 uppercase">
          Coming soon
        </p>
      </div>
      <Footer />
    </main>
  );
}
