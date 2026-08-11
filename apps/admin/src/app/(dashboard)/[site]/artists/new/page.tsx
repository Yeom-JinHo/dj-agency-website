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
    // max-w-4xl: 사이드바(16rem)+콘텐츠 패딩과 합쳐 1200px — 1366 노트북까지 들어가고
    // 사이드바 도입 전 값(2xl)이 남기던 우측 여백을 회수한다. 긴 텍스트의 measure는
    // 폼의 설명 카드 2열 그리드가 잡는다(한 열 ≈55자). 스켈레톤도 같은 폭이어야 한다.
    // 폼이 아니라 여기 있어야 헤더(브레드크럼·제목·삭제)와 폼의 우측 기준선이 맞는다.
    <div className="max-w-4xl min-w-0 space-y-6">
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
