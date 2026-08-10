import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteSlugSchema } from "@repo/content/schema";

import { EntityBreadcrumb } from "@/components/entity-breadcrumb";
import { rosterOptions } from "@/lib/roster-options";
import { isSiteSlug, SITE_LABELS } from "@/lib/sites";
import { TourForm } from "../tour-form";
import { emptyTourFormValues } from "../schema";

// 제목 규약은 (dashboard)/page.tsx 주석 참고. params만 읽으므로 DB 조회는 늘지 않는다.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ site: string }>;
}): Promise<Metadata> {
  const { site } = await params;
  if (!isSiteSlug(site)) return { title: "ye0m2 admin" };
  return { title: `새 투어 · ${SITE_LABELS[site]} | ye0m2 admin` };
}

export default async function NewTourPage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site: siteParam } = await params;
  const parsed = siteSlugSchema.safeParse(siteParam);
  if (!parsed.success) notFound();
  const site = parsed.data;

  // artist select는 같은 사이트 소속 로스터만. 아티스트 미노출 사이트에선 빈 배열이고
  // 폼도 셀렉트를 렌더하지 않는다(rosterOptions 주석).
  const artists = await rosterOptions(site);

  return (
    <div className="space-y-6">
      <EntityBreadcrumb site={site} category="tours" current="새 투어" />
      <div className="space-y-1">
        {/* 브레드크럼이 위치를 말하므로 h1은 최상위보다 한 단 작다(목록·상세와 같은 규칙). */}
        <h1 className="text-xl font-semibold tracking-tight">새 투어</h1>
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
