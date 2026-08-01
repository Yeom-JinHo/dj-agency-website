import { notFound } from "next/navigation";
import { siteSlugSchema } from "@repo/content/schema";

import { ArtistForm } from "../artist-form";
import { emptyArtistFormValues } from "../schema";

export default async function NewArtistPage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site: siteParam } = await params;
  const parsed = siteSlugSchema.safeParse(siteParam);
  if (!parsed.success) notFound();
  const site = parsed.data;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">새 아티스트</h1>
        <p className="text-muted-foreground text-sm">
          이 사이트에 소속된 아티스트를 만듭니다. 저장하면 즉시 반영됩니다.
        </p>
      </div>
      <ArtistForm mode="create" site={site} defaultValues={emptyArtistFormValues} />
    </div>
  );
}
