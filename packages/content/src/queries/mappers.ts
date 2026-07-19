import { z } from "zod";
import type { Database } from "../supabase/database.types";
import {
  platformLinksSchema,
  selectedWorkSchema,
  socialSchema,
} from "../schema";
import type { SiteSlug } from "../schema/site";
import type { Artist, Release, Tour } from "../schema";

/**
 * DB row → 도메인 타입 매퍼(snake→camel)와 jsonb 격리. 브라우저 안전(server-only 아님).
 * 사이트용 캐시 조회(`./queries`)와 admin 비캐시 조회(`./admin-queries`)가 이 한 곳을
 * 공유해 매핑 로직 중복을 제거한다.
 */

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

export function mapArtist(row: ArtistRow): Artist {
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

export function mapRelease(row: ReleaseRow): Release {
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

export function mapTour(row: TourRow): Tour {
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
