import { Skeleton } from "@/components/ui/skeleton";

/**
 * 사이트 홈(page.tsx) 전용 로딩 폴백 — 카테고리 카드 3개 그리드 골격.
 * artists·releases·tours 등 하위 목록 라우트는 형태가 다른(테이블) 화면이라
 * ListLoadingSkeleton을 따로 쓴다. 하나의 폴백에 두 형태를 묶으면 사이트 홈
 * 진입 시 테이블 스켈레톤 → 카드 3개로 튀는 레이아웃 시프트가 생긴다.
 */
export default function SiteLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-4 w-56 max-w-full" />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg border p-5"
          >
            <Skeleton className="size-10 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-8" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
