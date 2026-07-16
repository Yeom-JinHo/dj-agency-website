/**
 * 캐시 무효화 태그 빌더(§4.2 스킴). 브라우저 안전 — server-only 아님.
 * queries의 unstable_cache 태깅과 admin 발행(P3)이 같은 정의를 공유해
 * "발행 깜빡"·태그 오타를 구조적으로 제거한다.
 */
export const contentTags = {
  artist: (slug: string) => `artist:${slug}` as const,
  artists: "artists",
  release: (slug: string) => `release:${slug}` as const,
  releases: "releases",
  tours: "tours",
} as const;
