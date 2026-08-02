import Link from "next/link";
import { notFound } from "next/navigation";
import {
  adminCountArtists,
  adminCountReleases,
  adminCountTours,
} from "@repo/content/admin-queries";

import { CATEGORY_ICONS } from "@/components/category-icons";
import { safeCount } from "@/lib/safe-count";
import {
  CATEGORIES,
  isSiteSlug,
  SITE_LABELS,
  type CategorySegment,
} from "@/lib/sites";

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
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {SITE_LABELS[site]}
        </h1>
        <p className="text-muted-foreground text-sm">
          관리할 카테고리를 선택하세요.
        </p>
      </div>

      {/* 드릴다운 카드 어휘는 대시보드 홈((dashboard)/page.tsx)과 한 벌이다 — 32px 아이콘 슬롯 +
          제목/카운트 2줄 텍스트, 가로 배치·gap-4·p-5·rounded-lg·hover:bg-muted/50까지 같다.
          아이콘 "채움"만 다르다: 여긴 단색 lucide 글리프라 bg-muted 판을 깔아 몸을 주고,
          대시보드는 자기 색을 가진 브랜드 래스터라 판 없이 헤어라인 ring만 두른다.
          글리프 16px은 사이드바 nav와 같은 크기 — 카드에서 고른 아이콘이 이동 후 nav에서
          같은 무게로 다시 보인다. */}
      <div className="grid gap-4 sm:grid-cols-3">
        {CATEGORIES.map((category) => {
          const Icon = CATEGORY_ICONS[category.segment];
          const count = counts[category.segment];
          return (
            <Link
              key={category.segment}
              href={`/${site}/${category.segment}`}
              className="hover:bg-muted/50 flex items-center gap-4 rounded-lg border p-5 transition-colors"
            >
              <div className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
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
