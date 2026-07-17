import { notFound } from "next/navigation";
import { z } from "zod";
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

const socialsArraySchema = z.array(socialSchema);
const selectedWorksArraySchema = z.array(selectedWorkSchema);

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
    socials: socialsArraySchema.safeParse(artist.socials).data ?? [],
    selectedWorks:
      selectedWorksArraySchema.safeParse(artist.selected_works).data ?? [],
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
