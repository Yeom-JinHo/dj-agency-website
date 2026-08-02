import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * [site] 그룹 404 — 사이드바([site]/layout.tsx)를 유지한 채 콘텐츠 컬럼만 이
 * 안내로 교체한다((dashboard)/not-found.tsx는 site 파라미터 자체가 무효라
 * 사이드바를 그릴 근거가 없을 때만 쓰인다). 콘텐츠 컬럼은 grid stretch로 이미
 * 전체 높이를 확보하므로 min-h-[60vh] 대신 min-h-full로 그 안에서 중앙 정렬한다.
 */
export default function SiteNotFound() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 text-center">
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
