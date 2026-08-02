import { Skeleton } from "@/components/ui/skeleton";

/**
 * 대시보드 세그먼트 로딩 폴백. 모든 라우트가 인증 쿠키에 의존하는
 * dynamic 렌더라 네비게이션마다 서버 왕복이 발생 — 그동안 카드 그리드
 * 골격을 보여 무반응 블로킹을 없앤다. ([site] 하위는 전용 폴백 사용)
 */
export default function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* 막대 높이 규약(제목은 정확값, 본문·메타는 래퍼가 줄 높이를 먹고 막대는 −4px)은
          components/list-loading-skeleton.tsx 상단 주석에 한 번만 적어 뒀다.
          래퍼는 실제 헤더와 같은 space-y-1 — 종전 space-y-2는 4px 넓어 설명 줄부터
          아래가 그만큼 당겨졌다. 이제 32 + 4 + 20 = 56px으로 실제 헤더와 같다. */}
      <div className="space-y-1">
        {/* 대시보드 h1은 브레드크럼이 없어 text-2xl을 유지하므로 h-8(32px) 정확값 그대로. */}
        <Skeleton className="h-8 w-40" />
        <div className="flex h-5 items-center">
          <Skeleton className="h-4 w-64" />
        </div>
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
            {/* 두 줄 간격은 실제 카드의 mt-0.5(2px)와 같은 space-y-0.5 — 종전 space-y-1.5는
                6px이라 4px 넓었다. 래퍼 높이까지 맞으면 텍스트 컬럼이 24 + 2 + 16 = 42px으로
                실제와 같아지고, 카드 높이도 p-5 + max(아이콘 32px, 42px) = 82px으로 일치한다
                (종전 34px 컬럼이라 카드가 8px 낮았다). */}
            <div className="min-w-0 flex-1 space-y-0.5">
              {/* 카드 h2는 text-base(24px) — 본문 규약을 따라 래퍼 h-6 + 막대 h-5. */}
              <div className="flex h-6 items-center">
                <Skeleton className="h-5 w-28" />
              </div>
              {/* 카드 2번째 줄 = 카테고리 3종 카운트 요약이라 사이트 홈보다 길다.
                  text-xs(16px)라 래퍼 h-4 + 막대 h-3. */}
              <div className="flex h-4 items-center">
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
