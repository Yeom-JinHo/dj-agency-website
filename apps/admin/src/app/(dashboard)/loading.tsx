import { Skeleton } from "@/components/ui/skeleton";

/**
 * 대시보드 세그먼트 로딩 폴백. 모든 라우트가 인증 쿠키에 의존하는
 * dynamic 렌더라 네비게이션마다 서버 왕복이 발생 — 그동안 카드 그리드
 * 골격을 보여 무반응 블로킹을 없앤다. ([site] 하위는 전용 폴백 사용)
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2 rounded-lg border p-5">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-4 w-36" />
            {/* 카드 3번째 줄 = 엔티티 카운트 요약. */}
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  );
}
