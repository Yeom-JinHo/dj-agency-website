/**
 * 캐시 무효화 태그 빌더(§4.2 스킴). 브라우저 안전 — server-only 아님.
 * 소속 모델이라 slug는 사이트 내에서만 유니크 → 태그·캐시 키를 모두 사이트 결합한다.
 * queries의 unstable_cache 태깅과 admin 발행(P3)이 같은 정의를 공유해
 * "발행 깜빡"·태그 오타를 구조적으로 제거한다.
 */
import type { SiteSlug } from "./schema/site";

export const contentTags = {
  artist: (site: SiteSlug, slug: string) => `artist:${site}:${slug}` as const,
  artists: (site: SiteSlug) => `artists:${site}` as const,
  release: (site: SiteSlug, slug: string) => `release:${site}:${slug}` as const,
  releases: (site: SiteSlug) => `releases:${site}` as const,
  tours: (site: SiteSlug) => `tours:${site}` as const,
} as const;
