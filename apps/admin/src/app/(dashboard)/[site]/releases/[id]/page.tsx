import { notFound } from "next/navigation";
import {
  adminGetReleaseById,
  adminListArtists,
} from "@repo/content/admin-queries";
import { PLATFORM_LINK_KEYS, type SiteSlug } from "@repo/content/schema";

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
  const siteSlug = site as SiteSlug;

  const [release, artists] = await Promise.all([
    adminGetReleaseById(id),
    adminListArtists(siteSlug),
  ]);

  if (!release) notFound();

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
