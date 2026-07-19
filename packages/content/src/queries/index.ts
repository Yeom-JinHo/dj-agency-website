import { unstable_cache } from "next/cache";
import { createAnonClient } from "../supabase/anon";
import type { SiteSlug } from "../schema/site";
import type { Artist, Release, Tour } from "../schema";
import { mapArtist, mapRelease, mapTour } from "./mappers";
import { contentTags } from "../tags";

// 소속 모델: 사이트 필터는 단순 컬럼 조건 + sort_order 정렬(이전 조인 테이블 no-op 소멸).
async function fetchArtists(siteSlug: SiteSlug): Promise<Artist[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("site_slug", siteSlug)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(mapArtist);
}

async function fetchArtistBySlug(
  siteSlug: SiteSlug,
  slug: string,
): Promise<Artist | null> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("site_slug", siteSlug)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapArtist(data) : null;
}

async function fetchReleases(siteSlug: SiteSlug): Promise<Release[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("releases")
    .select("*")
    .eq("site_slug", siteSlug)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(mapRelease);
}

async function fetchReleaseBySlug(
  siteSlug: SiteSlug,
  slug: string,
): Promise<Release | null> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("releases")
    .select("*")
    .eq("site_slug", siteSlug)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRelease(data) : null;
}

async function fetchTours(siteSlug: SiteSlug): Promise<Tour[]> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("site_slug", siteSlug)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(mapTour);
}

/**
 * 사이트 소비용 조회 함수. 소속 모델이라 siteSlug가 필수 인자이며, 사이트 필터는
 * `site_slug` 컬럼 조건 + `sort_order` 정렬로 처리한다(조인 테이블 제거).
 * 각 함수는 contentTags 스킴(§4.2, 사이트 결합)으로 unstable_cache 태깅한다.
 */
export async function getArtists(siteSlug: SiteSlug): Promise<Artist[]> {
  return unstable_cache(() => fetchArtists(siteSlug), ["artists", siteSlug], {
    tags: [contentTags.artists(siteSlug)],
  })();
}

export async function getArtistBySlug(
  siteSlug: SiteSlug,
  slug: string,
): Promise<Artist | null> {
  return unstable_cache(
    () => fetchArtistBySlug(siteSlug, slug),
    ["artist", siteSlug, slug],
    {
      tags: [contentTags.artist(siteSlug, slug), contentTags.artists(siteSlug)],
    },
  )();
}

export async function getReleases(siteSlug: SiteSlug): Promise<Release[]> {
  return unstable_cache(() => fetchReleases(siteSlug), ["releases", siteSlug], {
    tags: [contentTags.releases(siteSlug)],
  })();
}

export async function getReleaseBySlug(
  siteSlug: SiteSlug,
  slug: string,
): Promise<Release | null> {
  return unstable_cache(
    () => fetchReleaseBySlug(siteSlug, slug),
    ["release", siteSlug, slug],
    {
      tags: [
        contentTags.release(siteSlug, slug),
        contentTags.releases(siteSlug),
      ],
    },
  )();
}

export async function getTours(siteSlug: SiteSlug): Promise<Tour[]> {
  return unstable_cache(() => fetchTours(siteSlug), ["tours", siteSlug], {
    tags: [contentTags.tours(siteSlug)],
  })();
}
