import Image from "next/image";
import Link from "next/link";
import { SITE_SLUGS } from "@repo/content/schema";
import {
  adminCountArtists,
  adminCountReleases,
  adminCountTours,
} from "@repo/content/admin-queries";

import { safeCount } from "@/lib/safe-count";
import {
  CATEGORIES,
  SITE_ICONS,
  SITE_LABELS,
  type CategorySegment,
} from "@/lib/sites";

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
      // 조회 실패(null)를 필터링해 숨기지 않는다 — "원래 카운트 없음"과 구분이 안 되기 때문.
      // site를 함께 담아 렌더에서 인덱스로 되찾지 않는다(짝이 어긋날 여지를 없앤다).
      return {
        site,
        counts: CATEGORIES.map(({ segment, label }) => ({
          segment,
          label,
          count: bySegment[segment],
        })),
      };
    }),
  );

  return (
    <div className="space-y-6 p-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">대시보드</h1>
        <p className="text-muted-foreground text-sm">
          관리할 사이트를 선택하세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaries.map(({ site, counts }) => {
          return (
            <Link
              key={site}
              href={`/${site}`}
              className="hover:bg-muted/50 rounded-lg border p-5 transition-colors"
            >
              <h2 className="flex items-center gap-2 text-base font-medium">
                <Image
                  src={SITE_ICONS[site]}
                  alt=""
                  aria-hidden
                  width={18}
                  height={18}
                  className="ring-border size-[18px] shrink-0 rounded-[4px] ring-1"
                />
                {SITE_LABELS[site]}
              </h2>
              <p className="text-muted-foreground mt-1 font-mono text-sm">{site}</p>
              <p className="text-muted-foreground mt-3 text-xs tabular-nums">
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
            </Link>
          );
        })}
      </div>
    </div>
  );
}
