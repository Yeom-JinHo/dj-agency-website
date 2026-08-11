import { Skeleton } from "@/components/ui/skeleton";

/**
 * 상세·새로 만들기(폼 화면) 전용 로딩 폴백. [site]/loading.tsx(테이블형)는 목록·
 * 카테고리 홈에만 맞아 폼 라우트에 뜨면 레이아웃 시프트가 생긴다 — 실제 폼 골격
 * (제목 + 필드 블록 + 하단 액션 바)에 맞춘 스켈레톤을 6개 폼 라우트가 공유한다.
 *
 * leadingImage는 이미지 필드가 폼 맨 앞에 오는 라우트에서 켠다. 릴리즈만 아트워크를
 * 기본 정보 최상단으로 올렸고 artist(프로필)·tour(포스터)는 아직 하단이라, 이 블록을
 * 무조건 그리면 그 네 라우트에서 오히려 첫 페인트가 어긋난다.
 */
export function FormLoadingSkeleton({
  leadingImage = false,
}: {
  leadingImage?: boolean;
} = {}) {
  return (
    <div className="space-y-6">
      {/* 실제 폼 헤더는 space-y-1이다 — 여기만 space-y-2면 제목/설명 간격이 4px 넓어
          로드 직후 설명 줄과 그 아래 전체가 위로 당겨진다. */}
      <div className="space-y-1">
        {/* h-7 = 28px = text-xl의 line-height. 상세·new의 h1도 목록과 같이
            text-2xl(32px = h-8)에서 한 단 내려왔다.
            폭은 목록과 달리 w-48을 유지한다 — 여기 제목은 엔티티명(아티스트명·릴리즈
            제목)이라 길이를 알 수 없어 맞출 대상 자체가 없다. '새 아티스트'류만 고정이다. */}
        {/* 제목이라 정확값 규약 — h-7 = 28px = text-xl의 line-height(상세·new의 h1도
            목록과 같이 text-2xl에서 한 단 내려왔다). 폭은 목록과 달리 w-48을 유지한다 —
            여기 제목은 엔티티명(아티스트명·릴리즈 제목)이라 길이를 알 수 없어 맞출 대상이 없다. */}
        <Skeleton className="h-7 w-48" />
        {/* 본문이라 래퍼 규약 — 래퍼가 text-sm 한 줄(20px)을 차지하고 막대는 4px 낮다.
            막대만 h-5로 키우면 시프트는 없어져도 다른 폴백보다 굵어 룩이 어긋난다.
            폭 w-80(320px)은 '아티스트를 편집합니다. 저장하면 즉시 사이트에 반영됩니다.'
            (≈24글자)에 맞는 값이라 유지한다. */}
        <div className="flex h-5 items-center">
          <Skeleton className="h-4 w-80 max-w-full" />
        </div>
      </div>
      {/* 폭은 세 폼의 fieldset(max-w-4xl)과 같은 값 — 다르면 로드 직후 폼이 옆으로 튄다. */}
      <div className="max-w-4xl min-w-0 space-y-4">
        {/* ImageField 첫 페인트 골격: 라벨 + (128px 정사각 자리 · 버튼 + 힌트 줄).
            치수는 ImageField와 같은 값이어야 한다(size-32 / size="sm" 버튼 h-8 /
            힌트 text-xs) — 다르면 로드 직후 폼 전체가 세로로 튄다. */}
        {leadingImage ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <div className="flex items-center gap-4">
              <Skeleton className="size-32 shrink-0 rounded-md" />
              <div className="min-w-0 flex-1 space-y-1">
                <Skeleton className="h-8 w-28" />
                {/* 본문이라 래퍼 규약 — 래퍼가 text-xs 한 줄(16px)을 차지하고
                    막대는 4px 낮다(제목 스켈레톤의 정확값 규약과 대비). */}
                <div className="flex h-4 items-center">
                  <Skeleton className="h-3 w-40" />
                </div>
              </div>
            </div>
          </div>
        ) : null}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
        <div className="flex items-center gap-3 border-t py-4">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}
