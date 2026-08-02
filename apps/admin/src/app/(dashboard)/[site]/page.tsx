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
              <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-md">
                <Icon className="size-5" aria-hidden />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-medium">{category.label}</h2>
                <p className="text-muted-foreground mt-0.5 text-sm tabular-nums">
                  {count === null ? (
                    // 분류사가 엔티티마다 달라(명/개/회) postfix 없이 숫자만.
                    // 조회 실패는 —로 채운다 — 대시보드 홈과 실패 표기 규칙을 통일.
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
