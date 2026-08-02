import { Skeleton } from "@/components/ui/skeleton";

/**
 * 목록(테이블) 화면 전용 로딩 폴백. artists·releases·tours 3개 목록 라우트가
 * 공유한다 — 사이트 홈은 카드 그리드라 형태가 달라 [site]/loading.tsx로 분리했다
 * (FormLoadingSkeleton과 동형 분리).
 */
export function ListLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* 실제 목록 헤더는 좌측이 space-y-1 안의 h1 + 설명 <p> 2줄이다(artists·releases·
          tours/page.tsx). 종전 폴백은 좌측에 막대 하나뿐이라 28px vs 52px, 약 24px만큼
          아래 검색창·테이블이 통째로 밀렸다 — 구조를 그대로 따라간다.
          우측 버튼 자리는 그대로 둔다: 실제 헤더의 '새 …' 버튼은 rows.length > 0일 때만
          있지만, (1) 목록이 비어 있는 쪽이 예외이고, (2) justify-between이라 이 막대는
          좌측 컬럼 위치에 영향을 주지 않으며, (3) 설명 줄이 생기면서 좌측 컬럼(52px)이
          버튼(h-9 = 36px)보다 높아져 행 높이를 좌측이 결정한다 — 빈 목록에서 버튼이
          사라져도 세로 시프트가 없다. 빈 경우에 맞춰 지우면 흔한 경우가 대신 밀린다. */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          {/* h-7 = 28px = text-xl의 line-height(1.25rem × calc(1.75/1.25)). 목록 h1이
              text-2xl(32px = h-8)에서 한 단 내려오면서 같이 내렸다.
              폭은 셋('아티스트'·'릴리즈'·'투어')이 2~4글자로 제각각이라 정확히 맞출 수 없다.
              가장 긴 '아티스트'(20px 글리프 4개 ≈ 80px)에 여유를 둔 w-24(96px)로 잡는다 —
              종전 w-48(192px)은 가장 긴 제목의 두 배가 넘어 로드 직후 막대가 반으로 줄었다. */}
          <Skeleton className="h-7 w-24" />
          {/* h-5 = 20px = text-sm의 line-height(0.875rem × calc(1.25/0.875)), theme.css 실측.
              폭은 세 문구가 '이 사이트에 소속된 아티스트 로스터.'(15글자 ≈ 225px)부터
              '예정된 공연 일정.'(7글자 ≈ 108px)까지 2배 넘게 벌어져 한 값으로 다 맞출 수 없다.
              가장 긴 쪽에 붙이면 가장 짧은 쪽이 두 배 넘게 줄어드니, 짧은 쪽 기준 2배를
              넘지 않는 선에서 최대인 w-52(208px)로 잡는다 — 긴 문구는 8% 모자라고
              짧은 문구는 1.9배다. */}
          <Skeleton className="h-5 w-52" />
        </div>
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
