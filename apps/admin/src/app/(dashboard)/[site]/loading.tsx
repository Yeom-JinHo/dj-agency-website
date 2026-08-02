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
      {/* 막대 높이 규약(제목은 정확값, 본문·메타는 래퍼가 줄 높이를 먹고 막대는 −4px)은
          components/list-loading-skeleton.tsx 상단 주석에 한 번만 적어 뒀다. */}
      <div className="space-y-1">
        {/* 사이트 홈 h1도 브레드크럼이 없어 text-2xl을 유지하므로 h-8(32px) 정확값 그대로.
            32 + 4 + 20 = 56px으로 실제 헤더와 같다. */}
        <Skeleton className="h-8 w-32" />
        <div className="flex h-5 items-center">
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg border p-5 shadow-sm"
          >
            {/* 아이콘 슬롯은 실제 카드(page.tsx)와 같은 size-8 — 예전 size-10은 40px이라
                데이터 도착 시 칩이 눈에 띄게 줄어들었다. shadow-sm도 같은 이유로 맞춘다. */}
            <Skeleton className="size-8 shrink-0 rounded-md" />
            {/* 두 줄 간격은 실제 카드의 mt-0.5(2px)와 같은 space-y-0.5 — 종전 space-y-1.5는
                6px이라 4px 넓었다. 래퍼 높이까지 맞으면 텍스트 컬럼이 24 + 2 + 20 = 46px으로
                실제와 같아지고, 카드 높이도 p-5 + max(아이콘 32px, 46px) = 86px으로 일치한다
                (종전 38px 컬럼이라 카드가 8px 낮았다). 카운트가 대시보드(text-xs)와 달리
                text-sm이라 이 카드가 4px 더 높은 것도 실제 그대로다. */}
            <div className="min-w-0 flex-1 space-y-0.5">
              {/* 카드 h2는 text-base(24px) — 본문 규약을 따라 래퍼 h-6 + 막대 h-5. */}
              <div className="flex h-6 items-center">
                <Skeleton className="h-5 w-16" />
              </div>
              {/* 카운트는 text-sm(20px) — 래퍼 h-5 + 막대 h-4. */}
              <div className="flex h-5 items-center">
                <Skeleton className="h-4 w-8" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
