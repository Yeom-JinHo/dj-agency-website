import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteSlugSchema } from "@repo/content/schema";

import { EntityBreadcrumb } from "@/components/entity-breadcrumb";
import { isSiteSlug, SITE_LABELS } from "@/lib/sites";
import { ArtistForm } from "../artist-form";
import { emptyArtistFormValues } from "../schema";

// 제목 규약은 (dashboard)/page.tsx 주석 참고. params만 읽으므로 DB 조회는 늘지 않는다.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ site: string }>;
}): Promise<Metadata> {
  const { site } = await params;
  if (!isSiteSlug(site)) return { title: "ye0m2 admin" };
  return { title: `새 아티스트 · ${SITE_LABELS[site]} | ye0m2 admin` };
}

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
      <EntityBreadcrumb site={site} category="artists" current="새 아티스트" />
      <div className="space-y-1">
        {/* 브레드크럼이 위치를 말하므로 h1은 최상위보다 한 단 작다(목록·상세와 같은 규칙). */}
        <h1 className="text-xl font-semibold tracking-tight">새 아티스트</h1>
        <p className="text-muted-foreground text-sm">
          이 사이트에 소속된 아티스트를 만듭니다. 저장하면 즉시 반영됩니다.
        </p>
      </div>
      <ArtistForm mode="create" site={site} defaultValues={emptyArtistFormValues} />
    </div>
  );
}
