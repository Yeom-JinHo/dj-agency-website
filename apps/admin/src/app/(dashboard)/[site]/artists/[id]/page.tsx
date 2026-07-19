import { notFound } from "next/navigation";
import { z } from "zod";
import { siteSlugSchema } from "@repo/content/schema";
import { adminGetArtistById } from "@repo/content/admin-queries";

import { mediaUrl } from "@/lib/media";
import { ArtistForm } from "../artist-form";
import { type ArtistFormValues } from "../schema";
import { DeleteArtistButton } from "../delete-artist-button";

export const dynamic = "force-dynamic";

export default async function EditArtistPage({
  params,
}: {
  params: Promise<{ site: string; id: string }>;
}) {
  const { site: siteParam, id } = await params;
  const parsed = siteSlugSchema.safeParse(siteParam);
  if (!parsed.success) notFound();
  const site = parsed.data;

  // id도 site처럼 선검증 — 비-uuid 손입력 URL이 Postgres 22P02로 500이 되지 않게 404 처리.
  if (!z.string().uuid().safeParse(id).success) notFound();

  const artist = await adminGetArtistById(id);
  // 다른 사이트의 아티스트를 이 라우트로 편집하지 못하게 소속 방어.
  if (!artist || artist.siteSlug !== site) notFound();

  // adminGetArtistById가 Artist로 파싱해 socials/selectedWorks는 이미 검증된 배열 —
  // 페이지 단위 재파싱 불필요(§7.4 쿼리 경계가 파싱 소유).
  const defaultValues: ArtistFormValues = {
    name: artist.name,
    nickname: artist.nickname ?? "",
    shortDescriptionEn: artist.shortDescriptionEn ?? "",
    shortDescriptionKo: artist.shortDescriptionKo ?? "",
    fullDescriptionEn: artist.fullDescriptionEn ?? "",
    fullDescriptionKo: artist.fullDescriptionKo ?? "",
    city: artist.city ?? "",
    socials: artist.socials,
    selectedWorks: artist.selectedWorks,
    sortOrder: artist.sortOrder,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {artist.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            아티스트를 편집합니다. 저장하면 즉시 사이트에 반영됩니다.
          </p>
        </div>
        <DeleteArtistButton
          site={site}
          artistId={artist.id}
          artistName={artist.name}
        />
      </div>
      <ArtistForm
        mode="edit"
        site={site}
        artistId={artist.id}
        slug={artist.slug}
        defaultValues={defaultValues}
        initialProfileUrl={mediaUrl(artist.imagePath)}
        initialLogoUrl={mediaUrl(artist.logoImagePath)}
      />
    </div>
  );
}
