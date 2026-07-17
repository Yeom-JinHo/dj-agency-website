import { notFound } from "next/navigation";
import type { z } from "zod";
import { createServerSupabaseClient } from "@repo/content/supabase/server";
import {
  selectedWorkSchema,
  socialSchema,
  type SiteSlug,
} from "@repo/content/schema";

import { mediaUrl } from "@/lib/media";
import { ArtistForm } from "../artist-form";
import { type ArtistFormValues } from "../schema";
import { DeleteArtistButton } from "../delete-artist-button";

export const dynamic = "force-dynamic";

/**
 * jsonb 배열을 항목 단위로 파싱한다: 불량 항목 1건 때문에 배열 전체가 []로
 * 덮여 유효 데이터가 유실되는 걸 막고, 드롭된 항목만 경고로 남긴다.
 */
function parseItems<T>(
  itemSchema: z.ZodType<T>,
  raw: unknown,
  ctx: string,
): T[] {
  if (!Array.isArray(raw)) {
    if (raw != null) console.warn(`[admin] ${ctx}: 배열이 아님, 드롭`);
    return [];
  }
  const out: T[] = [];
  raw.forEach((item, index) => {
    const result = itemSchema.safeParse(item);
    if (result.success) {
      out.push(result.data);
    } else {
      console.warn(`[admin] ${ctx}[${index}] 파싱 실패, 드롭`, result.error.issues);
    }
  });
  return out;
}

export default async function EditArtistPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const { data: artist } = await supabase
    .from("artists")
    .select("*, artist_sites(site_slug, sort_order)")
    .eq("id", id)
    .maybeSingle();

  if (!artist) notFound();

  const sites = artist.artist_sites
    .map((s) => ({
      siteSlug: s.site_slug as SiteSlug,
      sortOrder: s.sort_order,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const defaultValues: ArtistFormValues = {
    name: artist.name,
    nickname: artist.nickname ?? "",
    shortDescriptionEn: artist.short_description_en ?? "",
    shortDescriptionKo: artist.short_description_ko ?? "",
    fullDescriptionEn: artist.full_description_en ?? "",
    fullDescriptionKo: artist.full_description_ko ?? "",
    city: artist.city ?? "",
    socials: parseItems(
      socialSchema,
      artist.socials,
      `artist ${artist.slug} (${artist.id}) socials`,
    ),
    selectedWorks: parseItems(
      selectedWorkSchema,
      artist.selected_works,
      `artist ${artist.slug} (${artist.id}) selected_works`,
    ),
    sites,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {artist.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            Edit artist. Saving publishes immediately.
          </p>
        </div>
        <DeleteArtistButton artistId={artist.id} artistName={artist.name} />
      </div>
      <ArtistForm
        mode="edit"
        artistId={artist.id}
        slug={artist.slug}
        defaultValues={defaultValues}
        initialProfileUrl={mediaUrl(artist.image_path)}
        initialLogoUrl={mediaUrl(artist.logo_image_path)}
      />
    </div>
  );
}
