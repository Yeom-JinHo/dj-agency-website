"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

/**
 * (dashboard) 그룹 에러 바운더리 — 여기 두면 헤더(내비·로그아웃)는 살아있는 채
 * 본문만 교체돼 사용자가 스스로 복구할 수 있다. ([site] 아래 두면 대시보드
 * 홈 오류를 못 잡는다.)
 */
export default function DashboardError({
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
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
