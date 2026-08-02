"use client";

import { useEffect } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * (dashboard) 그룹 에러 바운더리 — 여기 두면 헤더(로고·로그아웃)는 살아있는 채
 * 본문만 교체돼 사용자가 스스로 복구할 수 있다. 사이트 사이드바가 있는 화면의
 * 오류는 [site]/error.tsx가 더 가까운 경계에서 잡아 사이드바를 유지한다.
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
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">문제가 발생했습니다</h1>
        <p className="text-muted-foreground text-sm">
          일시적인 오류일 수 있습니다. 다시 시도해주세요.
        </p>
      </div>
      {/* DB 일시 장애처럼 원인이 지속되면 reset()은 같은 에러를 다시 렌더할 뿐이라
          재시도만으로는 갇힌다. 이 화면은 사이드바조차 없어 본문 밖 탈출구가 없으므로
          같은 위치의 not-found.tsx와 같은 문구·마크업으로 복귀 링크를 나란히 둔다. */}
      <div className="flex items-center gap-2">
        <Button type="button" variant="outline" onClick={reset}>
          다시 시도
        </Button>
        <Button asChild variant="outline">
          <Link href="/">대시보드로 돌아가기</Link>
        </Button>
      </div>
    </div>
  );
}
