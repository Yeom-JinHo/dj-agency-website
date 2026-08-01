import Link from "next/link";
import { SITE_SLUGS } from "@repo/content/schema";
import {
  adminCountArtists,
  adminCountReleases,
  adminCountTours,
} from "@repo/content/admin-queries";

import { safeCount } from "@/lib/safe-count";
import { CATEGORIES, SITE_LABELS, type CategorySegment } from "@/lib/sites";

// 인증 세션(쿠키)·비캐시 admin 카운트에 의존하므로 정적 프리렌더 제외.
export const dynamic = "force-dynamic";

// 사이트-우선 라우트(§8): 대시보드는 4개 사이트 카드 → /[site].
export default async function DashboardPage() {
  // 4개 사이트 × 3엔티티 = 12개 카운트를 모두 병렬로 던진다.
  const summaries = await Promise.all(
    SITE_SLUGS.map(async (site) => {
      const [artists, releases, tours] = await Promise.all([
        safeCount(adminCountArtists(site)),
        safeCount(adminCountReleases(site)),
        safeCount(adminCountTours(site)),
      ]);
      const bySegment: Record<CategorySegment, number | null> = {
        artists,
        releases,
        tours,
      };
      // 라벨은 CATEGORIES 단일 출처 — 사이트 홈 카드와 같은 표기를 쓴다.
      return CATEGORIES.filter(({ segment }) => bySegment[segment] !== null)
        .map(({ segment, label }) => `${label} ${bySegment[segment]}`)
        .join(" · ");
    }),
  );

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground text-sm">
          관리할 사이트를 선택하세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SITE_SLUGS.map((site, index) => {
          const summary = summaries[index];
          return (
            <Link
              key={site}
              href={`/${site}`}
              className="hover:bg-muted/50 rounded-lg border p-5 transition-colors"
            >
              <h2 className="text-base font-medium">{SITE_LABELS[site]}</h2>
              <p className="text-muted-foreground mt-1 font-mono text-sm">{site}</p>
              {summary ? (
                <p className="text-muted-foreground mt-3 text-xs tabular-nums">
                  {summary}
                </p>
              ) : null}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
