"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * [site] 그룹 에러 바운더리 — 사이드바([site]/layout.tsx)를 유지한 채 콘텐츠
 * 컬럼만 이 화면으로 교체한다((dashboard)/error.tsx는 사이드바가 없는 대시보드
 * 홈 오류만 잡는다). 콘텐츠 컬럼은 grid stretch로 이미 전체 높이를 확보하므로
 * min-h-[60vh] 대신 min-h-full로 그 안에서 중앙 정렬한다.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 원문은 로그로만 — 화면에는 고정 문구(내부 오류 메시지 노출 방지).
    console.error("[admin] route error:", error);
  }, [error]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 text-center">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">문제가 발생했습니다</h1>
        <p className="text-muted-foreground text-sm">
          일시적인 오류일 수 있습니다. 다시 시도해주세요.
        </p>
      </div>
      <Button type="button" variant="outline" onClick={reset}>
        다시 시도
      </Button>
    </div>
  );
}
