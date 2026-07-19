import { adminListArtists } from "@repo/content/admin-queries";
import type { SiteSlug } from "@repo/content/schema";

import { ReleaseForm } from "../release-form";
import { emptyReleaseFormValues } from "../schema";

export const dynamic = "force-dynamic";

export default async function NewReleasePage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  const siteSlug = site as SiteSlug;

  const artists = await adminListArtists(siteSlug);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">새 릴리즈</h1>
        <p className="text-muted-foreground text-sm">
          이 사이트의 릴리즈를 만듭니다. 저장하면 즉시 반영됩니다.
        </p>
      </div>
      <ReleaseForm
        mode="create"
        site={siteSlug}
        defaultValues={emptyReleaseFormValues}
        artists={artists}
      />
    </div>
  );
}
