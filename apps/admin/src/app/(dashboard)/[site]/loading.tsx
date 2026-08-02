import { Skeleton } from "@/components/ui/skeleton";

/**
 * [site] 하위 로딩 폴백 — 목록·카테고리 홈 전용이다([id]·new 같은 폼 라우트는
 * FormLoadingSkeleton을 쓴다). 목록(테이블)에 맞춘 "헤더 + 행 목록" 골격.
 */
export default function SiteLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-28" />
      </div>
      {/* 목록의 검색창 자리 — 폴백에서 테이블만 그리면 로드 후 위로 밀린다. */}
      <Skeleton className="h-9 w-64" />
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
