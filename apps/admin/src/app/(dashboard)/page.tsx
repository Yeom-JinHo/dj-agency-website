import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE_SLUGS, type SiteSlug } from "@repo/content/schema";
import {
  adminCountArtists,
  adminCountReleases,
  adminCountTours,
} from "@repo/content/admin-queries";

import { safeCount } from "@/lib/safe-count";
import {
  siteCategories,
  SITE_ICONS,
  SITE_LABELS,
  type CategorySegment,
} from "@/lib/sites";

/** 세그먼트 → 카운트 조회. 사이트마다 노출 카테고리가 달라 조회를 세그먼트로 고른다. */
const COUNT_BY_SEGMENT: Record<
  CategorySegment,
  (site: SiteSlug) => Promise<number>
> = {
  artists: adminCountArtists,
  releases: adminCountReleases,
  tours: adminCountTours,
};

/**
 * 라우트별 제목 규약의 기준점. Next의 AppRouterAnnouncer는 `previousTitle !== currentTitle`
 * 일 때만 발화하므로, 루트 layout의 고정 "ye0m2 admin" 하나만 있던 동안에는 클라이언트
 * 네비게이션이 단 한 번도 어나운스되지 않았다(App Router는 포커스도 옮기지 않아
 * 스크린리더 사용자는 화면이 통째로 바뀐 걸 알 방법이 없었다 — WCAG 2.4.2 Level A).
 *
 * 포맷은 `{페이지} · {사이트라벨} | ye0m2 admin`으로 고정한다. 루트 layout의 title이
 * 문자열이라 `template`이 없으므로 접미사는 각 페이지가 직접 붙인다. 이 화면은
 * 사이트 위가 없어 가운데 단이 빠진다.
 */
export const metadata: Metadata = {
  title: "대시보드 | ye0m2 admin",
};

// 사이트-우선 라우트(§8): 대시보드는 4개 사이트 카드 → /[site].
export default async function DashboardPage() {
  // 사이트별 노출 카테고리(SITE_CATEGORY_SEGMENTS)만큼만 병렬로 던진다 —
  // 4×3=12개를 무조건 세던 것에서 실제 노출분으로 줄었다(안 보여줄 수를 셀 이유가 없다).
  const summaries = await Promise.all(
    SITE_SLUGS.map(async (site) => {
      // 라벨은 CATEGORIES 단일 출처 — 사이트 홈에서 카드 제목으로 쓰이는 그 문자열이다.
      // 조회 실패(null)를 필터링해 숨기지 않는다 — "원래 카운트 없음"과 구분이 안 되기 때문.
      // site를 함께 담아 렌더에서 인덱스로 되찾지 않는다(짝이 어긋날 여지를 없앤다).
      const counts = await Promise.all(
        siteCategories(site).map(async ({ segment, label }) => ({
          segment,
          label,
          count: await safeCount(COUNT_BY_SEGMENT[segment](site)),
        }))
      );
      return { site, counts };
    })
  );

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        {/* 브레드크럼이 없는 최상위 화면이라 h1이 위치를 혼자 말한다 — text-2xl 유지.
            브레드크럼이 있는 하위(목록·상세·new)는 그 줄이 이미 위치를 말하므로 text-xl로 한 단 낮춘다. */}
        <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground text-sm">
          관리할 사이트를 선택하세요.
        </p>
      </div>

      {/* 드릴다운 카드 어휘는 사이트 홈([site]/page.tsx)과 한 벌이다 — 32px 아이콘 슬롯 +
          제목/카운트 2줄 텍스트, 가로 배치·gap-4·p-5·rounded-lg·hover:bg-muted/50까지 같다.
          편집자가 대시보드 → 사이트 홈을 연달아 보므로 눈에 띄는 건 배치와 아이콘이고,
          거기에 통일 예산을 쓴다. 나머지 두 차이는 정보 구조에서 나온 것이라 억지로 맞추지 않는다:
          (1) 아이콘 채움 — 아래 Image 주석 참고.
          (2) 카운트 표기 — 아래 카운트 줄 주석 참고.

          표면감: 이 카드는 <Card>가 아니라 직접 만든 <Link>라 shadcn Card의 shadow-sm을
          물려받지 못해 배경과 같은 평면에 눌러붙어 "구분선 쳐진 리스트 행"으로 읽혔다.
          shadow-sm을 기본으로 주고 hover에서 그림자 한 단 + 2px 리프트로 눌리는 표면임을 알린다
          (리프트는 4px 이내로 절제 — 그 이상이면 카드가 뜨는 게 아니라 튀어 보인다).
          reduced-motion은 globals.css 전역 처방이 맡으므로 여기서 motion-reduce를 중복하지 않는다.
          포커스 링: p-5의 큰 히트 영역인데 링이 없어 브라우저 기본 1px 아웃라인으로 떨어졌다.
          키보드 사용자가 매 세션 처음 만나는 화면이라 앱 공통 어휘(button.tsx·data-table.tsx와
          같은 ring-ring/50 + ring-[3px])를 인라인으로 맞춘다. */}
      {/* max-w-6xl — 초광폭에서 카드가 화면 끝까지 늘어나 내용(아이콘+2줄) 대비
          과도하게 헐거워졌다. 목록 테이블은 콘텐츠가 폭을 쓰므로 캡하지 않고,
          진입 화면의 카드 그리드만 캡한다(사이트 홈과 같은 값). 5xl까지 좁히면
          4열에서 가장 긴 사이트명(Vague Frequency Labs)이 개행돼 6xl에 멈춘다. */}
      <div className="grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaries.map(({ site, counts }) => {
          return (
            <Link
              key={site}
              href={`/${site}`}
              className="hover:bg-muted/50 focus-visible:ring-ring/50 flex items-center gap-4 rounded-lg border p-5 shadow-sm transition-[box-shadow,transform,background-color] outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-[3px]"
            >
              {/* 사이트 아이콘은 브랜드 래스터라 카테고리 글리프처럼 판(bg-primary/10)을 깔지 않는다 —
                  이미 자기 색·형태를 가진 마크를 색 판에 얹으면 상자가 이중이 되고 브랜드색과 충돌한다.
                  판 대신 헤어라인 ring으로 몸을 주되 슬롯 크기·radius는 사이트 홈과 같게 둬서
                  두 화면이 같은 자리·같은 모양으로 읽히게 한다.
                  표시 32px은 원본 에셋 64px과 2x DPR에서 정확히 맞물린다(lib/sites.ts 참고) —
                  더 키우면 소스가 모자라 흐려진다. */}
              <Image
                src={SITE_ICONS[site]}
                alt=""
                aria-hidden
                width={32}
                height={32}
                className="ring-border size-8 shrink-0 rounded-md ring-1"
              />
              <div className="min-w-0">
                <h2 className="text-base font-medium">{SITE_LABELS[site]}</h2>
                {/* 카드 하나가 그 사이트의 카테고리(최대 3개)를 한 줄로 요약하므로 라벨이
                    없으면 "3 · 5 · 2"가 되어 무엇의 수인지 알 수 없다. 사이트 홈은 카드마다
                    카운트가 하나뿐이고 제목이 곧 라벨이라 숫자만 쓴다 — 표기가 다른 건 이
                    구조 차이 때문이다. text-xs도 같은 이유: lg:grid-cols-4 한 칸에 라벨+숫자가
                    최대 3쌍 들어간다. (사이트 홈은 카드 하나에 숫자 하나뿐이라 text-sm.) */}
                <p className="text-muted-foreground mt-0.5 text-xs tabular-nums">
                  {counts.map(({ segment, label, count }, i) => (
                    <span key={segment}>
                      {i > 0 ? " · " : ""}
                      {label}{" "}
                      {count === null ? (
                        // 조회 실패는 —로 채워 자리를 남긴다. 빈 자리는 "원래 카운트 없음"으로 오독된다.
                        // aria-label은 role 없는 span에선 무시될 수 있어 sr-only 텍스트로 전달한다.
                        <span title="카운트를 불러오지 못했습니다">
                          <span aria-hidden>—</span>
                          <span className="sr-only">
                            {label} 카운트를 불러오지 못했습니다
                          </span>
                        </span>
                      ) : (
                        count
                      )}
                    </span>
                  ))}
                </p>
              </div>
              {/* 클릭 어포던스 — 카드에 버튼·화살표가 없어 "누르는 것"이라는 신호가
                  안내 문구뿐이었다. 무채색 chevron 하나로 방향을 알린다(액센트 불증가). */}
              <ChevronRight
                className="text-muted-foreground ml-auto size-4 shrink-0"
                aria-hidden
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
