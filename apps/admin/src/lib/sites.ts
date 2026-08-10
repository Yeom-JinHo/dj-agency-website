import type { StaticImageData } from "next/image";
import { SITE_SLUGS, type SiteSlug } from "@repo/content/schema";

import celebrateAgencyIcon from "@/assets/site-icons/celebrate-agency.webp";
import juntaroIcon from "@/assets/site-icons/juntaro.webp";
import paydayRecordsIcon from "@/assets/site-icons/payday-records.webp";
import vagueFrequencyLabsIcon from "@/assets/site-icons/vague-frequency-labs.webp";

/**
 * 사이트-우선 라우트(§8)의 공용 상수. SITE_SLUGS는 @repo/content/schema에서 소비하고,
 * admin UI 표시명·카테고리 라벨을 여기서 매핑한다. 대시보드 카드·사이트 스위처·
 * 카테고리 내비·site 파라미터 검증이 모두 이 한 곳을 공유한다.
 */

/** 사이트 슬러그 → admin 표시명(DB sites.name과 동일). */
export const SITE_LABELS: Record<SiteSlug, string> = {
  "vague-frequency-labs": "Vague Frequency Labs",
  "payday-records": "Payday Records",
  "celebrate-agency": "Celebrate Agency",
  juntaro: "Juntaro",
};

/** 각 사이트 홈의 카테고리 3종. 라우트 세그먼트와 1:1.
 * releases 라벨은 목록·버튼·빈 상태의 h1 어휘("릴리즈")와 같은 말을 쓴다 —
 * 내비·브레드크럼·카운트만 "뮤직"이던 이중 어휘를 릴리즈로 통일했다. */
export const CATEGORIES = [
  { segment: "artists", label: "아티스트" },
  { segment: "releases", label: "릴리즈" },
  { segment: "tours", label: "투어" },
] as const;

/** 카테고리 라우트 세그먼트. 카운트를 세그먼트 키로 다루는 화면들이 공유한다. */
export type CategorySegment = (typeof CATEGORIES)[number]["segment"];

/**
 * 사이트별 admin 노출 범위. CATEGORIES가 "카테고리가 무엇인지"의 단일 출처라면
 * 이 맵은 "어느 사이트가 어느 카테고리를 쓰는지"의 단일 출처다 —
 * 사이드바 nav·대시보드/사이트 홈 카운트·스위처 이동 대상·카테고리 라우트 가드·
 * 릴리즈/투어 폼의 로스터 셀렉트가 모두 이 한 맵에서 갈린다.
 *
 * DB가 아니라 코드에 두는 이유: `site_slug` FK는 전역이라 DB는 어느 사이트에나 어떤
 * 엔티티든 넣을 수 있고(0001_init.sql), 실제 제약은 "각 사이트가 무엇을 렌더하는가"라는
 * 개발자 결정이다(cms-plan.md §13 "celebrate-agency 범위 → Artist만"). 편집자가 런타임에
 * 바꾸는 값이 아니므로 컬럼·조회를 늘리지 않는다. 공개 앱이나 publish/revalidate가
 * 이 범위로 분기해야 할 때 @repo/content로 승격한다 — 지금 소비처는 admin뿐.
 */
export const SITE_CATEGORY_SEGMENTS: Record<
  SiteSlug,
  readonly CategorySegment[]
> = {
  "vague-frequency-labs": ["artists", "releases"],
  "payday-records": ["releases"],
  "celebrate-agency": ["artists"],
  juntaro: ["releases", "tours"],
};

/** 해당 사이트가 쓰는 카테고리만 CATEGORIES 순서대로. 라벨이 필요한 렌더가 쓴다. */
export function siteCategories(
  site: SiteSlug
): readonly (typeof CATEGORIES)[number][] {
  return CATEGORIES.filter((c) =>
    SITE_CATEGORY_SEGMENTS[site].includes(c.segment)
  );
}

/** 이 사이트에서 해당 카테고리를 노출하는가(라우트 가드·조건부 필드 판정용). */
export function hasSiteCategory(
  site: SiteSlug,
  segment: CategorySegment
): boolean {
  return SITE_CATEGORY_SEGMENTS[site].includes(segment);
}

/** 사이트별 앱 아이콘(스위처·대시보드 카드 표시용). 각 앱 icon.png를 64px webp로 리사이즈한 복사본. */
export const SITE_ICONS: Record<SiteSlug, StaticImageData> = {
  "vague-frequency-labs": vagueFrequencyLabsIcon,
  "payday-records": paydayRecordsIcon,
  "celebrate-agency": celebrateAgencyIcon,
  juntaro: juntaroIcon,
};

/** 임의 문자열이 유효한 사이트 슬러그인지 좁힘(라우트 site 파라미터 검증용). */
export function isSiteSlug(value: string): value is SiteSlug {
  return (SITE_SLUGS as readonly string[]).includes(value);
}
