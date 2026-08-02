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
      // 라벨은 CATEGORIES 단일 출처 — 사이트 홈에서 카드 제목으로 쓰이는 그 문자열이다.
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

      {/* 드릴다운 카드 어휘는 사이트 홈([site]/page.tsx)과 한 벌이다 — 32px 아이콘 슬롯 +
          제목/카운트 2줄 텍스트, 가로 배치·gap-4·p-5·rounded-lg·hover:bg-muted/50까지 같다.
          편집자가 대시보드 → 사이트 홈을 연달아 보므로 눈에 띄는 건 배치와 아이콘이고,
          거기에 통일 예산을 쓴다. 나머지 두 차이는 정보 구조에서 나온 것이라 억지로 맞추지 않는다:
          (1) 아이콘 채움 — 아래 Image 주석 참고.
          (2) 카운트 표기 — 아래 카운트 줄 주석 참고. */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {summaries.map(({ site, counts }) => {
          return (
            <Link
              key={site}
              href={`/${site}`}
              className="hover:bg-muted/50 flex items-center gap-4 rounded-lg border p-5 transition-colors"
            >
              {/* 사이트 아이콘은 브랜드 래스터라 카테고리 글리프처럼 bg-muted 판을 깔지 않는다 —
                  이미 자기 색·형태를 가진 마크를 회색 판에 얹으면 상자가 이중이 되고 브랜드색과 충돌한다.
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
                {/* 카드 하나가 카테고리 3개를 요약하므로 라벨이 없으면 "3 · 5 · 2"가 되어
                    무엇의 수인지 알 수 없다. 사이트 홈은 카드마다 카운트가 하나뿐이고
                    제목이 곧 라벨이라 숫자만 쓴다 — 표기가 다른 건 이 구조 차이 때문이다.
                    text-xs도 같은 이유: lg:grid-cols-4 한 칸에 라벨+숫자 3쌍이 들어간다.
                    (사이트 홈은 3칸에 숫자 하나뿐이라 text-sm.) */}
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
            </Link>
          );
        })}
      </div>
    </div>
  );
}
