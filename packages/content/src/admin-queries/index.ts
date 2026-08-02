import "server-only";
import { createServerSupabaseClient } from "../supabase/server";
import type { SiteSlug } from "../schema/site";
import type { Artist, Release, Tour } from "../schema";
import { mapArtist, mapRelease, mapTour } from "../queries/mappers";

/**
 * admin 전용 조회(§7.4 계약). 사이트용 `./queries`와 물리적으로 분리한다:
 * - **인증 서버 클라이언트**(createServerSupabaseClient) — editors RLS 하에서 읽는다.
 * - **`unstable_cache` 미사용** — admin은 사이트 앱과 별개 배포라 `publish()`가 admin
 *   자신의 캐시를 무효화하지 못한다. 캐시하면 저장 후에도 편집자가 영구 stale 목록을 본다.
 * 매퍼는 `../queries/mappers`를 공유(중복 없음). 소속 모델이라 목록은 site_slug 컬럼
 * 조건 + sort_order 정렬, 단건은 전역 id로 조회한다.
 */

export async function adminListArtists(siteSlug: SiteSlug): Promise<Artist[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("site_slug", siteSlug)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(mapArtist);
}

export async function adminListReleases(
  siteSlug: SiteSlug,
): Promise<Release[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("releases")
    .select("*")
    .eq("site_slug", siteSlug)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(mapRelease);
}

export async function adminListTours(siteSlug: SiteSlug): Promise<Tour[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("site_slug", siteSlug)
    .order("sort_order");
  if (error) throw error;
  return (data ?? []).map(mapTour);
}

/**
 * 개수만 필요한 화면(대시보드 사이트 카드·사이트 홈 카테고리 카드)용 카운트 3종.
 * `head: true`라 행 본문을 전혀 전송하지 않는다 — 목록 함수를 불러 length를 세는
 * 대안은 4개 사이트 × 3엔티티 전량을 실어 나르게 되므로 배제.
 */
export async function adminCountArtists(siteSlug: SiteSlug): Promise<number> {
  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase
    .from("artists")
    .select("*", { count: "exact", head: true })
    .eq("site_slug", siteSlug);
  if (error) throw error;
  return count ?? 0;
}

export async function adminCountReleases(siteSlug: SiteSlug): Promise<number> {
  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase
    .from("releases")
    .select("*", { count: "exact", head: true })
    .eq("site_slug", siteSlug);
  if (error) throw error;
  return count ?? 0;
}

export async function adminCountTours(siteSlug: SiteSlug): Promise<number> {
  const supabase = await createServerSupabaseClient();
  const { count, error } = await supabase
    .from("tours")
    .select("*", { count: "exact", head: true })
    .eq("site_slug", siteSlug);
  if (error) throw error;
  return count ?? 0;
}

export async function adminGetArtistById(id: string): Promise<Artist | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapArtist(data) : null;
}

export async function adminGetReleaseById(
  id: string,
): Promise<Release | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("releases")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRelease(data) : null;
}

export async function adminGetTourById(id: string): Promise<Tour | null> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("tours")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? mapTour(data) : null;
}
