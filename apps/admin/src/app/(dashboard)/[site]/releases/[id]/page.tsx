import { notFound } from "next/navigation";
import { z } from "zod";
import {
  adminGetReleaseById,
  adminListArtists,
} from "@repo/content/admin-queries";
import { PLATFORM_LINK_KEYS, siteSlugSchema } from "@repo/content/schema";

import { mediaUrl } from "@/lib/media";
import { ReleaseForm } from "../release-form";
import { type ReleaseFormValues } from "../schema";
import { DeleteReleaseButton } from "../delete-release-button";

export const dynamic = "force-dynamic";

export default async function EditReleasePage({
  params,
}: {
  params: Promise<{ site: string; id: string }>;
}) {
  const { site, id } = await params;
  // artist 패턴과 동일한 3중 방어: site 검증 + uuid 선검증(비-uuid 손입력 → 404) + 소속 대조.
  const parsedSite = siteSlugSchema.safeParse(site);
  if (!parsedSite.success) notFound();
  const siteSlug = parsedSite.data;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const [release, artists] = await Promise.all([
    adminGetReleaseById(id),
    adminListArtists(siteSlug),
  ]);

  // 다른 사이트의 릴리즈를 이 라우트로 편집하지 못하게 소속 방어.
  if (!release || release.siteSlug !== siteSlug) notFound();

  // platform_links → 5개 확정 키의 문자열 폼 표현(빈 키는 ""). Release는 이미 파싱된 도메인 객체.
  const platformLinks = Object.fromEntries(
    PLATFORM_LINK_KEYS.map((k) => [k, release.platformLinks[k] ?? ""]),
  ) as Record<(typeof PLATFORM_LINK_KEYS)[number], string>;

  const defaultValues: ReleaseFormValues = {
    title: release.title,
    primaryArtistId: release.primaryArtistId ?? "",
    artistCredit: release.artistCredit ?? "",
    featuredArtists: release.featuredArtists.join(", "),
    label: release.label ?? "",
    catalogNo: release.catalogNo ?? "",
    releaseDate: release.releaseDate ?? "",
    shortDescriptionEn: release.shortDescriptionEn ?? "",
    shortDescriptionKo: release.shortDescriptionKo ?? "",
    fullDescriptionEn: release.fullDescriptionEn ?? "",
    fullDescriptionKo: release.fullDescriptionKo ?? "",
    platformLinks,
    socials: release.socials,
    sortOrder: release.sortOrder,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {release.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            릴리즈를 편집합니다. 저장하면 즉시 반영됩니다.
          </p>
        </div>
        <DeleteReleaseButton
          site={siteSlug}
          releaseId={release.id}
          releaseTitle={release.title}
        />
      </div>
      <ReleaseForm
        mode="edit"
        site={siteSlug}
        releaseId={release.id}
        slug={release.slug}
        defaultValues={defaultValues}
        artists={artists}
        initialArtworkUrl={mediaUrl(release.artworkPath)}
      />
    </div>
  );
}
