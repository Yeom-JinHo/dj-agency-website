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

/** 각 사이트 홈의 카테고리 3종. 라우트 세그먼트와 1:1. */
export const CATEGORIES = [
  { segment: "artists", label: "아티스트" },
  { segment: "releases", label: "뮤직" },
  { segment: "tours", label: "투어" },
] as const;

/** 카테고리 라우트 세그먼트. 카운트를 세그먼트 키로 다루는 화면들이 공유한다. */
export type CategorySegment = (typeof CATEGORIES)[number]["segment"];

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
