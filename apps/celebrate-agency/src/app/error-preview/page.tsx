"use client";

// 임시: ErrorBoundary fallback 화면을 celebrate preview에서 확인하기 위한 라우트.
// 확인 후(머지 전) 이 라우트를 제거한다.
import { useState } from "react";

export default function ErrorPreviewPage() {
  const [boom, setBoom] = useState(false);

  // 클라이언트 이벤트로만 throw → SSR 정상, 클라이언트 렌더에서 ErrorBoundary가 캐치
  if (boom) {
    throw new Error("Preview: intentional error to view ErrorBoundary");
  }

  return (
    <main className="flex min-h-[100dvh] items-center justify-center bg-[#0a0a0a]">
      <button
        type="button"
        onClick={() => setBoom(true)}
        className="rounded-full border border-white/25 bg-white/10 px-7 py-2.5 font-mono text-[11px] tracking-[0.18em] text-white uppercase backdrop-blur-sm transition-colors hover:bg-white/20"
      >
        Trigger error
      </button>
    </main>
  );
}
