import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { adminListArtists } from "@repo/content/admin-queries";
import { siteSlugSchema } from "@repo/content/schema";

import { EntityBreadcrumb } from "@/components/entity-breadcrumb";
import { isSiteSlug, SITE_LABELS } from "@/lib/sites";
import { ReleaseForm } from "../release-form";
import { emptyReleaseFormValues } from "../schema";

// 제목 규약은 (dashboard)/page.tsx 주석 참고. params만 읽으므로 DB 조회는 늘지 않는다.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ site: string }>;
}): Promise<Metadata> {
  const { site } = await params;
  if (!isSiteSlug(site)) return { title: "ye0m2 admin" };
  return { title: `새 릴리즈 · ${SITE_LABELS[site]} | ye0m2 admin` };
}

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
      <EntityBreadcrumb site={siteSlug} category="releases" current="새 릴리즈" />
      <div className="space-y-1">
        {/* 브레드크럼이 위치를 말하므로 h1은 최상위보다 한 단 작다(목록·상세와 같은 규칙). */}
        <h1 className="text-xl font-semibold tracking-tight">새 릴리즈</h1>
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
