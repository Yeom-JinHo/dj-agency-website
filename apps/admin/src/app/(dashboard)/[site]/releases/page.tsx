import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  adminListReleases,
  adminListArtists,
} from "@repo/content/admin-queries";
import { siteSlugSchema } from "@repo/content/schema";
import { Disc3 } from "lucide-react";

import { mediaUrl } from "@/lib/media";
import { formatDate } from "@/lib/format-date";
import { EmptyState } from "@/components/empty-state";
import { EntityBreadcrumb } from "@/components/entity-breadcrumb";
import { NewEntityButton } from "@/components/new-entity-button";
import { Button } from "@/components/ui/button";
import { isSiteSlug, SITE_LABELS } from "@/lib/sites";
import { ReleasesTable, type ReleaseRow } from "./releases-table";

// 제목 규약은 (dashboard)/page.tsx 주석 참고. 가운데 단은 화면의 h1 어휘("릴리즈")를 쓴다 —
// CATEGORIES 라벨도 릴리즈로 통일돼 내비·브레드크럼·탭 제목이 같은 말을 한다.
// params만 읽으므로 DB 조회는 늘지 않는다.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ site: string }>;
}): Promise<Metadata> {
  const { site } = await params;
  if (!isSiteSlug(site)) return { title: "ye0m2 admin" };
  return { title: `릴리즈 · ${SITE_LABELS[site]} | ye0m2 admin` };
}

export default async function ReleasesPage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  // artist 패턴과 동일: layout 가드에 더해 페이지에서도 site 재검증(방어 심층화).
  const parsedSite = siteSlugSchema.safeParse(site);
  if (!parsedSite.success) notFound();
  const siteSlug = parsedSite.data;

  const [releases, artists] = await Promise.all([
    adminListReleases(siteSlug),
    adminListArtists(siteSlug),
  ]);

  // primaryArtistId → 로스터 아티스트명(크레딧이 없을 때 표시용).
  const artistNameById = new Map(artists.map((a) => [a.id, a.name]));

  // 검색·정렬은 클라이언트가 하므로 셀에 쓰는 필드만 직렬화해 넘긴다.
  const rows: ReleaseRow[] = releases.map((release) => ({
    id: release.id,
    title: release.title,
    // credit(로스터 밖 표기) 우선, 없으면 연결된 로스터 아티스트명.
    artist:
      release.artistCredit ??
      (release.primaryArtistId
        ? (artistNameById.get(release.primaryArtistId) ?? null)
        : null),
    releaseDate: release.releaseDate ? formatDate(release.releaseDate) : null,
    sortOrder: release.sortOrder,
    updatedAt: formatDate(release.updatedAt),
    thumb: mediaUrl(release.artworkPath),
  }));

  return (
    <div className="space-y-6">
      <EntityBreadcrumb site={siteSlug} category="releases" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          {/* 위 브레드크럼이 이미 "여기가 어디인지"를 말하므로 h1은 최상위(대시보드·사이트 홈
              text-2xl)보다 한 단 작다 — 드릴다운할수록 제목이 작아져 방향감이 생긴다. */}
          <h1 className="text-xl font-semibold tracking-tight">릴리즈</h1>
          <p className="text-muted-foreground text-sm">
            이 사이트의 릴리즈.
          </p>
        </div>
        {/* 빈 상태에서는 CTA가 EmptyState 안에 있으므로 우상단 버튼을 숨긴다. */}
        {rows.length > 0 ? (
          <NewEntityButton href={`/${siteSlug}/releases/new`}>
            새 릴리즈
          </NewEntityButton>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Disc3}
          title="아직 릴리즈가 없습니다"
          description="이 사이트에서 발매한 음원을 추가하세요."
          action={
            // 목록 자체가 비어 있으면 돌아갈 검색 상태가 없으므로 쿼리를 싣지 않는다
            // (우상단 버튼과 달리 평범한 Link).
            <Button asChild>
              <Link href={`/${siteSlug}/releases/new`}>새 릴리즈</Link>
            </Button>
          }
        />
      ) : (
        <ReleasesTable rows={rows} basePath={`/${site}/releases`} />
      )}
    </div>
  );
}
