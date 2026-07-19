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
  const ctx = `artist ${row.site_slug}/${row.slug} (${row.id})`;
  return {
    id: row.id,
    siteSlug: row.site_slug as SiteSlug,
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
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRelease(row: ReleaseRow): Release {
  const ctx = `release ${row.site_slug}/${row.slug} (${row.id})`;
  return {
    id: row.id,
    siteSlug: row.site_slug as SiteSlug,
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
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapTour(row: TourRow): Tour {
  return {
    id: row.id,
    siteSlug: row.site_slug as SiteSlug,
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
    sortOrder: row.sort_order,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

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
