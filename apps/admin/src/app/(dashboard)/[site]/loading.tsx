import { Skeleton } from "@/components/ui/skeleton";

/**
 * [site] 하위 공용 로딩 폴백 — 카테고리 홈·목록·상세·새로 만들기 전부 커버.
 * 목록(테이블)과 폼 양쪽에 무난한 "헤더 + 행 목록" 골격 하나로 통일한다.
 */
export default function SiteLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-28" />
      </div>
      <div className="rounded-md border">
        <div className="border-b px-4 py-3">
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
          >
            <Skeleton className="size-9 shrink-0 rounded-md" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        ))}
      </div>
    </div>
  );
}
