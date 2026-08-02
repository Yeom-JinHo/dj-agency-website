import { Skeleton } from "@/components/ui/skeleton";

/**
 * 목록(테이블) 화면 전용 로딩 폴백. artists·releases·tours 3개 목록 라우트가
 * 공유한다 — 사이트 홈은 카드 그리드라 형태가 달라 [site]/loading.tsx로 분리했다
 * (FormLoadingSkeleton과 동형 분리).
 *
 * ## 스켈레톤 막대 높이 규약 (이 앱의 4개 폴백이 공유 — 여기 한 번만 적는다)
 *
 * 기존 값들을 Tailwind v4 theme.css 실측치와 대조해 보면 두 갈래였다:
 * - **제목(page h1)은 line-height 정확값** — 4곳(이 파일·FormLoadingSkeleton·
 *   (dashboard)/loading·[site]/loading)이 예외 없이 h-8 = text-2xl의 32px였다.
 * - **본문·메타는 line-height − 4px** — text-sm 설명은 h-4(20−4), text-xs 카운트는
 *   h-3(16−4), 테이블 셀도 h-4. 우연으로 보기엔 너무 고르다. 회색 블록을 줄 높이보다
 *   살짝 낮게 그려 가볍게 보이게 하는 의도로 읽는다.
 *
 * 문제는 후자가 그대로면 줄마다 4px씩 시프트가 남는다는 것이다. 그래서 **막대를
 * 키우지 않고 래퍼가 줄 높이를 차지한다** — `flex h-{line-height} items-center` 안에
 * 4px 낮은 막대를 넣으면 레이아웃은 실제와 정확히 같고 룩은 그대로다.
 * 제목 막대는 정확값 규약이라 래퍼가 필요 없다(막대 높이 = 줄 높이).
 *
 * 실측(theme.css): text-xs 16px / text-sm 20px / text-base 24px / text-xl 28px /
 * text-2xl 32px. 카드 h2(text-base)만 기존 h-4(16px)로 두 규약 어디에도 안 맞았는데,
 * 정확값(24px)보다 −4px값(20px)에 가깝고 컴팩트한 카드 안에서 24px 통막대는 무거워
 * 본문 쪽에 묶었다.
 *
 * 예외: 폼의 필드 라벨은 shadcn Label이 `text-sm leading-none`이라 실제 줄 높이가
 * 20px이 아니라 14px다 — 위 규약을 적용하면 안 되는 자리라 손대지 않았다.
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
          {/* 제목이라 정확값 규약 — h-7 = 28px = text-xl의 line-height. 목록 h1이
              text-2xl(32px = h-8)에서 한 단 내려오면서 같이 내렸다.
              폭은 셋('아티스트'·'릴리즈'·'투어')이 2~4글자로 제각각이라 정확히 맞출 수 없다.
              가장 긴 '아티스트'(20px 글리프 4개 ≈ 80px)에 여유를 둔 w-24(96px)로 잡는다 —
              종전 w-48(192px)은 가장 긴 제목의 두 배가 넘어 로드 직후 막대가 반으로 줄었다. */}
          <Skeleton className="h-7 w-24" />
          {/* 본문이라 래퍼 규약 — 래퍼가 text-sm 한 줄(20px)을 차지하고 막대는 그보다 4px 낮다.
              폭은 세 문구가 '이 사이트에 소속된 아티스트 로스터.'(15글자 ≈ 225px)부터
              '예정된 공연 일정.'(7글자 ≈ 108px)까지 2배 넘게 벌어져 한 값으로 다 맞출 수 없다.
              가장 긴 쪽에 붙이면 가장 짧은 쪽이 두 배 넘게 줄어드니, 짧은 쪽 기준 2배를
              넘지 않는 선에서 최대인 w-52(208px)로 잡는다 — 긴 문구는 8% 모자라고
              짧은 문구는 1.9배다. */}
          <div className="flex h-5 items-center">
            <Skeleton className="h-4 w-52" />
          </div>
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
