import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  adminCountArtists,
  adminCountReleases,
  adminCountTours,
} from "@repo/content/admin-queries";

import { CATEGORY_ICONS } from "@/components/category-icons";
import { EntityBreadcrumb } from "@/components/entity-breadcrumb";
import { safeCount } from "@/lib/safe-count";
import {
  CATEGORIES,
  isSiteSlug,
  SITE_LABELS,
  type CategorySegment,
} from "@/lib/sites";

/**
 * 사이트 라벨이 params에 달려 있어 정적 metadata로는 만들 수 없다(제목 규약은
 * (dashboard)/page.tsx 주석 참고). 라벨은 SITE_LABELS 단일 출처를 쓰고, DB는 건드리지
 * 않으므로 조회가 늘지 않는다. 무효 슬러그는 페이지가 notFound()로 보내므로 여기선
 * 원문 파라미터를 제목에 반사하지 않고 앱 이름만 남긴다.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ site: string }>;
}): Promise<Metadata> {
  const { site } = await params;
  if (!isSiteSlug(site)) return { title: "ye0m2 admin" };
  return { title: `${SITE_LABELS[site]} | ye0m2 admin` };
}

// 사이트 홈(§8): 카테고리 3카드 → /[site]/artists 등.
export default async function SiteHomePage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  if (!isSiteSlug(site)) notFound();

  const [artists, releases, tours] = await Promise.all([
    safeCount(adminCountArtists(site)),
    safeCount(adminCountReleases(site)),
    safeCount(adminCountTours(site)),
  ]);
  const counts: Record<CategorySegment, number | null> = {
    artists,
    releases,
    tours,
  };

  return (
    <div className="space-y-6">
      {/* 목록·상세엔 있던 브레드크럼이 이 화면에만 없어 대시보드로 나가는 경로가
          헤더 로고뿐이었다 — category 생략형(대시보드 > 사이트)으로 채운다. */}
      <EntityBreadcrumb site={site} />
      <div className="space-y-1">
        {/* 브레드크럼이 위치를 말하므로 h1은 목록·상세와 같은 text-xl —
            "브레드크럼이 붙으면 한 단 낮춘다" 규약을 이 화면에도 적용한다. */}
        <h1 className="text-xl font-semibold tracking-tight">
          {SITE_LABELS[site]}
        </h1>
        <p className="text-muted-foreground text-sm">
          관리할 카테고리를 선택하세요.
        </p>
      </div>

      {/* 드릴다운 카드 어휘는 대시보드 홈((dashboard)/page.tsx)과 한 벌이다 — 32px 아이콘 슬롯 +
          제목/카운트 2줄 텍스트, 가로 배치·gap-4·p-5·rounded-lg·hover:bg-muted/50까지 같다.
          아이콘 "채움"만 다르다: 여긴 단색 lucide 글리프라 판을 깔아 몸을 주고,
          대시보드는 자기 색을 가진 브랜드 래스터라 판 없이 헤어라인 ring만 두른다.
          판을 무채색(bg-muted)으로 두면 브랜드색이 있던 대시보드에서 드릴다운하는 순간
          화면에서 색이 통째로 사라졌다 — primary 틴트를 얹어 그 낙차를 없앤다
          ("primary/ring만 유채색" 원칙의 이 완화는 사용자 승인 범위).
          글리프 16px은 사이드바 nav와 같은 크기이고 nav의 active도 같은 인디고라,
          카드에서 고른 아이콘이 이동 후 nav에서 같은 무게·같은 색으로 다시 보인다.
          표면감·포커스 링은 대시보드 카드와 같은 처방 — 근거는 (dashboard)/page.tsx 주석. */}
      {/* max-w-6xl — 대시보드 홈과 같은 캡. 근거는 (dashboard)/page.tsx 주석. */}
      <div className="grid max-w-6xl gap-4 sm:grid-cols-3">
        {CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category.segment];
          const count = counts[category.segment];
          return (
            <Link
              key={category.segment}
              href={`/${site}/${category.segment}`}
              className="hover:bg-muted/50 focus-visible:ring-ring/50 flex items-center gap-4 rounded-lg border p-5 shadow-sm transition-[box-shadow,transform,background-color] outline-none hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-[3px]"
            >
              <div className="bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md">
                <Icon className="size-4" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-medium">{category.label}</h2>
                {/* 카드마다 카운트가 하나뿐이고 제목이 곧 라벨이라 숫자만 쓴다. 대시보드는
                    카드 하나가 카테고리 3개를 요약해 라벨이 필요하므로 표기가 다르다 —
                    구조가 달라서 다른 것이니 맞추지 않는다. 분류사도 엔티티마다 달라(명/개/회)
                    postfix는 붙이지 않는다. */}
                <p className="text-muted-foreground mt-0.5 text-sm tabular-nums">
                  {count === null ? (
                    // 조회 실패는 —로 채워 자리를 남긴다 — 실패 표기 규칙만은 대시보드 홈과 통일.
                    // aria-label은 role 없는 span에선 무시될 수 있어 sr-only 텍스트로 전달한다.
                    <span title="카운트를 불러오지 못했습니다">
                      <span aria-hidden>—</span>
                      <span className="sr-only">
                        {category.label} 카운트를 불러오지 못했습니다
                      </span>
                    </span>
                  ) : (
                    count
                  )}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
