import { unstable_cache } from "next/cache";
import { z } from "zod";
import { createAnonClient } from "../supabase/anon";
import type { Database } from "../supabase/database.types";
import {
  platformLinksSchema,
  selectedWorkSchema,
  socialSchema,
} from "../schema";
import type { SiteSlug } from "../schema/site";
import type { Artist, Release, Tour } from "../schema";
import { contentTags } from "../tags";

type ArtistRow = Database["public"]["Tables"]["artists"]["Row"];
type ReleaseRow = Database["public"]["Tables"]["releases"]["Row"];
type TourRow = Database["public"]["Tables"]["tours"]["Row"];

const socialsSchema = z.array(socialSchema);
const selectedWorksSchema = z.array(selectedWorkSchema);

/**
 * jsonb 필드는 safeParse로 격리한다: 한 행의 잘못된 데이터가 조회 전체를 throw하지 않도록
 * 실패 시 기본값으로 폴백하고 엔티티 id/slug를 붙여 경고를 남긴다.
 */
function parseOr<T>(
  schema: z.ZodType<T>,
  value: unknown,
  fallback: T,
  ctx: string,
): T {
  const result = schema.safeParse(value);
  if (result.success) return result.data;
  console.warn(
    `[content] ${ctx}: jsonb 파싱 실패, 기본값 사용`,
    result.error.issues,
  );
  return fallback;
}

function mapArtist(row: ArtistRow): Artist {
  const ctx = `artist ${row.slug} (${row.id})`;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    nickname: row.nickname,
    shortDescriptionEn: row.short_description_en,
    shortDescriptionKo: row.short_description_ko,
    fullDescriptionEn: row.full_description_en,
    fullDescriptionKo: row.full_description_ko,
    imagePath: row.image_path,
    logoImagePath: row.logo_image_path,
    imagePlaceholder: row.image_placeholder,
    city: row.city,
    selectedWorks: parseOr(
      selectedWorksSchema,
      row.selected_works,
      [],
      `${ctx} selected_works`,
    ),
    socials: parseOr(socialsSchema, row.socials, [], `${ctx} socials`),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRelease(row: ReleaseRow): Release {
  const ctx = `release ${row.slug} (${row.id})`;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    primaryArtistId: row.primary_artist_id,
    artistCredit: row.artist_credit,
    featuredArtists: row.featured_artists,
    label: row.label,
    catalogNo: row.catalog_no,
    artworkPath: row.artwork_path,
    artworkPlaceholder: row.artwork_placeholder,
    shortDescriptionEn: row.short_description_en,
    shortDescriptionKo: row.short_description_ko,
    fullDescriptionEn: row.full_description_en,
    fullDescriptionKo: row.full_description_ko,
    releaseDate: row.release_date,
    platformLinks: parseOr(
      platformLinksSchema,
      row.platform_links,
      {},
      `${ctx} platform_links`,
    ),
    socials: parseOr(socialsSchema, row.socials, [], `${ctx} socials`),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTour(row: TourRow): Tour {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    artistId: row.artist_id,
    venue: row.venue,
    city: row.city,
    country: row.country,
    eventDate: row.event_date,
    doorTime: row.door_time,
    ticketUrl: row.ticket_url,
    posterPath: row.poster_path,
    posterPlaceholder: row.poster_placeholder,
    descriptionEn: row.description_en,
    descriptionKo: row.description_ko,
    status: row.status as Tour["status"],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// 사이트 필터는 조인 테이블을 루트로 조회해야 노출 순서(sort_order)가 부모 행에 실제 반영된다.
// (엔티티를 루트로 두고 `.order(referencedTable)`을 쓰면 임베드 배열 내부만 정렬되는 no-op.)
async function fetchArtists(siteSlug?: SiteSlug): Promise<Artist[]> {
  const supabase = createAnonClient();
  if (siteSlug) {
    const { data, error } = await supabase
      .from("artist_sites")
      .select("sort_order, artists!inner(*)")
      .eq("site_slug", siteSlug)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []).map((r) => mapArtist(r.artists));
  }
  const { data, error } = await supabase.from("artists").select("*");
  if (error) throw error;
  return (data ?? []).map(mapArtist);
}

async function fetchArtistBySlug(slug: string): Promise<Artist | null> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("artists")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapArtist(data) : null;
}

async function fetchReleases(siteSlug?: SiteSlug): Promise<Release[]> {
  const supabase = createAnonClient();
  if (siteSlug) {
    const { data, error } = await supabase
      .from("release_sites")
      .select("sort_order, releases!inner(*)")
      .eq("site_slug", siteSlug)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []).map((r) => mapRelease(r.releases));
  }
  const { data, error } = await supabase.from("releases").select("*");
  if (error) throw error;
  return (data ?? []).map(mapRelease);
}

async function fetchReleaseBySlug(slug: string): Promise<Release | null> {
  const supabase = createAnonClient();
  const { data, error } = await supabase
    .from("releases")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? mapRelease(data) : null;
}

async function fetchTours(siteSlug?: SiteSlug): Promise<Tour[]> {
  const supabase = createAnonClient();
  if (siteSlug) {
    const { data, error } = await supabase
      .from("tour_sites")
      .select("sort_order, tours!inner(*)")
      .eq("site_slug", siteSlug)
      .order("sort_order");
    if (error) throw error;
    return (data ?? []).map((r) => mapTour(r.tours));
  }
  const { data, error } = await supabase.from("tours").select("*");
  if (error) throw error;
  return (data ?? []).map(mapTour);
}

/**
 * 사이트 소비용 조회 함수. 사이트 노출은 조인 테이블(`*_sites`)을 루트로 `!inner` 조회해
 * 필터하고, 노출 순서는 조인 테이블 `sort_order`로 정렬한다(사이트별 독립).
 * 각 함수는 contentTags 스킴(§4.2)으로 unstable_cache 태깅한다.
 */
export async function getArtists(siteSlug?: SiteSlug): Promise<Artist[]> {
  return unstable_cache(
    () => fetchArtists(siteSlug),
    ["artists", siteSlug ?? "all"],
    { tags: [contentTags.artists] },
  )();
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  return unstable_cache(() => fetchArtistBySlug(slug), ["artist", slug], {
    tags: [contentTags.artist(slug), contentTags.artists],
  })();
}

export async function getReleases(siteSlug?: SiteSlug): Promise<Release[]> {
  return unstable_cache(
    () => fetchReleases(siteSlug),
    ["releases", siteSlug ?? "all"],
    { tags: [contentTags.releases] },
  )();
}

export async function getReleaseBySlug(slug: string): Promise<Release | null> {
  return unstable_cache(() => fetchReleaseBySlug(slug), ["release", slug], {
    tags: [contentTags.release(slug), contentTags.releases],
  })();
}

export async function getTours(siteSlug?: SiteSlug): Promise<Tour[]> {
  return unstable_cache(() => fetchTours(siteSlug), ["tours", siteSlug ?? "all"], {
    tags: [contentTags.tours],
  })();
}
