import { unstable_cache } from "next/cache";
import { createAnonClient } from "../supabase/anon";
import type { Database } from "../supabase/database.types";
import {
  platformLinksSchema,
  selectedWorkSchema,
  socialSchema,
} from "../schema";
import type { SiteSlug } from "../schema/site";
import type { Artist, Release, Tour } from "../schema";
import { z } from "zod";

type ArtistRow = Database["public"]["Tables"]["artists"]["Row"];
type ReleaseRow = Database["public"]["Tables"]["releases"]["Row"];
type TourRow = Database["public"]["Tables"]["tours"]["Row"];

const socialsSchema = z.array(socialSchema);
const selectedWorksSchema = z.array(selectedWorkSchema);

function mapArtist(row: ArtistRow): Artist {
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
    selectedWorks: selectedWorksSchema.parse(row.selected_works ?? []),
    socials: socialsSchema.parse(row.socials ?? []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapRelease(row: ReleaseRow): Release {
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
    platformLinks: platformLinksSchema.parse(row.platform_links ?? {}),
    socials: socialsSchema.parse(row.socials ?? []),
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

async function fetchArtists(siteSlug?: SiteSlug): Promise<Artist[]> {
  const supabase = createAnonClient();
  if (siteSlug) {
    const { data, error } = await supabase
      .from("artists")
      .select("*, artist_sites!inner(site_slug, sort_order)")
      .eq("artist_sites.site_slug", siteSlug)
      .order("sort_order", { referencedTable: "artist_sites" });
    if (error) throw error;
    return (data ?? []).map(mapArtist);
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
      .from("releases")
      .select("*, release_sites!inner(site_slug, sort_order)")
      .eq("release_sites.site_slug", siteSlug)
      .order("sort_order", { referencedTable: "release_sites" });
    if (error) throw error;
    return (data ?? []).map(mapRelease);
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
      .from("tours")
      .select("*, tour_sites!inner(site_slug, sort_order)")
      .eq("tour_sites.site_slug", siteSlug)
      .order("sort_order", { referencedTable: "tour_sites" });
    if (error) throw error;
    return (data ?? []).map(mapTour);
  }
  const { data, error } = await supabase.from("tours").select("*");
  if (error) throw error;
  return (data ?? []).map(mapTour);
}

/**
 * 사이트 소비용 조회 함수. 사이트 노출은 `*_sites` 조인(!inner)으로 필터하고,
 * 노출 순서는 조인 테이블 `sort_order`로 정렬한다(사이트별 독립).
 * 각 함수는 unstable_cache 태깅으로 감싼다(§4.2 스킴).
 */
export async function getArtists(siteSlug?: SiteSlug): Promise<Artist[]> {
  return unstable_cache(() => fetchArtists(siteSlug), ["artists", siteSlug ?? "all"], {
    tags: ["artists"],
  })();
}

export async function getArtistBySlug(slug: string): Promise<Artist | null> {
  return unstable_cache(() => fetchArtistBySlug(slug), ["artist", slug], {
    tags: [`artist:${slug}`, "artists"],
  })();
}

export async function getReleases(siteSlug?: SiteSlug): Promise<Release[]> {
  return unstable_cache(() => fetchReleases(siteSlug), ["releases", siteSlug ?? "all"], {
    tags: ["releases"],
  })();
}

export async function getReleaseBySlug(slug: string): Promise<Release | null> {
  return unstable_cache(() => fetchReleaseBySlug(slug), ["release", slug], {
    tags: [`release:${slug}`, "releases"],
  })();
}

export async function getTours(siteSlug?: SiteSlug): Promise<Tour[]> {
  return unstable_cache(() => fetchTours(siteSlug), ["tours", siteSlug ?? "all"], {
    tags: ["tours"],
  })();
}
