import { SITE_SLUGS, type SiteSlug } from "@repo/content/schema";

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

/** 각 사이트 홈의 카테고리 3종. 라우트 세그먼트와 1:1. */
export const CATEGORIES = [
  { segment: "artists", label: "아티스트" },
  { segment: "releases", label: "뮤직" },
  { segment: "tours", label: "투어" },
] as const;

/** 임의 문자열이 유효한 사이트 슬러그인지 좁힘(라우트 site 파라미터 검증용). */
export function isSiteSlug(value: string): value is SiteSlug {
  return (SITE_SLUGS as readonly string[]).includes(value);
}
