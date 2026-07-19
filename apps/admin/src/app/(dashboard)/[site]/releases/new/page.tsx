import { notFound } from "next/navigation";
import { adminListArtists } from "@repo/content/admin-queries";
import { siteSlugSchema } from "@repo/content/schema";

import { ReleaseForm } from "../release-form";
import { emptyReleaseFormValues } from "../schema";

export const dynamic = "force-dynamic";

export default async function NewReleasePage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  // artist 패턴과 동일: layout 가드에 더해 페이지에서도 site 재검증(방어 심층화).
  const parsedSite = siteSlugSchema.safeParse(site);
  if (!parsedSite.success) notFound();
  const siteSlug = parsedSite.data;

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
