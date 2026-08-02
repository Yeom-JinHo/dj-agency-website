import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { siteSlugSchema } from "@repo/content/schema";
import { adminListArtists } from "@repo/content/admin-queries";

import { mediaUrl } from "@/lib/media";
import { formatDate } from "@/lib/format-date";
import { EmptyState } from "@/components/empty-state";
import { EntityBreadcrumb } from "@/components/entity-breadcrumb";
import { NewEntityButton } from "@/components/new-entity-button";
import { Button } from "@/components/ui/button";
import { isSiteSlug, SITE_LABELS } from "@/lib/sites";
import { ArtistsTable, type ArtistRow } from "./artists-table";

// 제목 규약은 (dashboard)/page.tsx 주석 참고. 가운데 단은 화면의 h1 어휘를 그대로 쓴다
// (브레드크럼·카드의 CATEGORIES 라벨이 아니라) — 탭 제목이 눈앞의 제목과 같아야
// 어나운스와 히스토리가 같은 말을 한다. params만 읽으므로 DB 조회는 늘지 않는다.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ site: string }>;
}): Promise<Metadata> {
  const { site } = await params;
  if (!isSiteSlug(site)) return { title: "ye0m2 admin" };
  return { title: `아티스트 · ${SITE_LABELS[site]} | ye0m2 admin` };
}

export default async function ArtistsPage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site: siteParam } = await params;
  const parsed = siteSlugSchema.safeParse(siteParam);
  if (!parsed.success) notFound();
  const site = parsed.data;

  const artists = await adminListArtists(site);
  // 검색·정렬은 클라이언트가 하므로 셀에 쓰는 필드만 직렬화해 넘긴다.
  const rows: ArtistRow[] = artists.map((artist) => ({
    id: artist.id,
    name: artist.name,
    slug: artist.slug,
    sortOrder: artist.sortOrder,
    updatedAt: formatDate(artist.updatedAt),
    thumb: mediaUrl(artist.imagePath),
  }));

  return (
    <div className="space-y-6">
      <EntityBreadcrumb site={site} category="artists" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          {/* 위 브레드크럼이 이미 "여기가 어디인지"를 말하므로 h1은 최상위(대시보드·사이트 홈
              text-2xl)보다 한 단 작다 — 드릴다운할수록 제목이 작아져 방향감이 생긴다. */}
          <h1 className="text-xl font-semibold tracking-tight">아티스트</h1>
          <p className="text-muted-foreground text-sm">
            이 사이트에 소속된 아티스트 로스터.
          </p>
        </div>
        {/* 빈 상태에서는 CTA가 EmptyState 안에 있으므로 우상단 버튼을 숨긴다. */}
        {rows.length > 0 ? (
          <NewEntityButton href={`/${site}/artists/new`}>
            새 아티스트
          </NewEntityButton>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="아직 아티스트가 없습니다"
          description="이 사이트의 로스터에 첫 아티스트를 추가하세요."
          action={
            // 목록 자체가 비어 있으면 돌아갈 검색 상태가 없으므로 쿼리를 싣지 않는다
            // (우상단 버튼과 달리 평범한 Link).
            <Button asChild>
              <Link href={`/${site}/artists/new`}>새 아티스트</Link>
            </Button>
          }
        />
      ) : (
        <ArtistsTable rows={rows} basePath={`/${site}/artists`} />
      )}
    </div>
  );
}
