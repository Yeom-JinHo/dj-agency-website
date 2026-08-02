import { Skeleton } from "@/components/ui/skeleton";

/**
 * 목록(테이블) 화면 전용 로딩 폴백. artists·releases·tours 3개 목록 라우트가
 * 공유한다 — 사이트 홈은 카드 그리드라 형태가 달라 [site]/loading.tsx로 분리했다
 * (FormLoadingSkeleton과 동형 분리).
 */
export function ListLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-9 w-28" />
      </div>
      {/* 목록의 검색창 자리 — 폴백에서 테이블만 그리면 로드 후 위로 밀린다.
          실제 검색창(data-table.tsx)은 max-w-xs(320px) 컨테이너 + h-9 Input. */}
      <Skeleton className="h-9 max-w-xs" />
      <div className="rounded-lg border">
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
