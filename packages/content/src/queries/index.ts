import type { SiteSlug } from "../schema/site";
import type { Artist, Release, Tour } from "../schema";

/**
 * 사이트 소비용 조회 함수. 사이트 노출은 `*_sites` 조인(!inner)으로 필터하고,
 * 노출 순서는 조인 테이블 `sort_order`로 정렬한다(사이트별 독립).
 * 각 함수는 unstable_cache 태깅으로 감싼다(P1 Wave 1).
 */
export async function getArtists(siteSlug?: SiteSlug): Promise<Artist[]> {
  void siteSlug;
  throw new Error("not implemented (P1 Wave 1)");
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  void slug;
  throw new Error("not implemented (P1 Wave 1)");
}

export async function getReleases(siteSlug?: SiteSlug): Promise<Release[]> {
  void siteSlug;
  throw new Error("not implemented (P1 Wave 1)");
}

export async function getReleaseBySlug(slug: string): Promise<Release | null> {
  void slug;
  throw new Error("not implemented (P1 Wave 1)");
}

export async function getTours(siteSlug?: SiteSlug): Promise<Tour[]> {
  void siteSlug;
  throw new Error("not implemented (P1 Wave 1)");
}
