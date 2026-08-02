import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * (dashboard) 그룹 404 — 삭제된 엔티티 북마크 재방문 등 notFound() 경로에서
 * 영문 기본 화면 대신 헤더를 유지한 한국어 안내 + 복귀 동선을 제공한다.
 */
export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">페이지를 찾을 수 없습니다</h1>
        <p className="text-muted-foreground text-sm">
          주소가 잘못됐거나 이미 삭제된 항목일 수 있습니다.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/">대시보드로 돌아가기</Link>
      </Button>
    </div>
  );
}
