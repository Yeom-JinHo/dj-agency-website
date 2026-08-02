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
      {/* 골격은 실제 카드(page.tsx)의 축을 그대로 따른다 — 32px 아이콘 슬롯 + 제목/카운트
          2줄 텍스트의 가로 배치. 예전에는 막대 3개를 세로로 쌓아 아이콘 자리가 없었고,
          데이터가 도착하는 순간 레이아웃이 세로→가로로 재구성되는 점프가 보였다.
          shadow-sm까지 맞춰 표면이 생기는 것도 아닌 "그림자만 뒤늦게 켜지는" 전환을 없앤다. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg border p-5 shadow-sm"
          >
            <Skeleton className="size-8 shrink-0 rounded-md" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-28" />
              {/* 카드 2번째 줄 = 카테고리 3종 카운트 요약이라 사이트 홈보다 길다. */}
              <Skeleton className="h-3 w-36" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
