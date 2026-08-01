import { notFound } from "next/navigation";
import { adminListArtists } from "@repo/content/admin-queries";
import { siteSlugSchema } from "@repo/content/schema";

import { TourForm } from "../tour-form";
import { emptyTourFormValues } from "../schema";

export const dynamic = "force-dynamic";

export default async function NewTourPage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site: siteParam } = await params;
  const parsed = siteSlugSchema.safeParse(siteParam);
  if (!parsed.success) notFound();
  const site = parsed.data;

  // artist select는 같은 사이트 소속 로스터만.
  const artists = await adminListArtists(site);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">새 투어</h1>
        <p className="text-muted-foreground text-sm">
          투어를 만듭니다. 저장하면 즉시 사이트에 반영됩니다.
        </p>
      </div>
      <TourForm
        mode="create"
        site={site}
        defaultValues={emptyTourFormValues}
        artists={artists}
      />
    </div>
  );
}
