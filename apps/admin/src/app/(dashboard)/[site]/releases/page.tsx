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
import { Button } from "@/components/ui/button";
import { ReleasesTable, type ReleaseRow } from "./releases-table";

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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">릴리즈</h1>
          <p className="text-muted-foreground text-sm">
            이 사이트의 릴리즈.
          </p>
        </div>
        {/* 빈 상태에서는 CTA가 EmptyState 안에 있으므로 우상단 버튼을 숨긴다. */}
        {rows.length > 0 ? (
          <Button asChild>
            <Link href={`/${site}/releases/new`}>새 릴리즈</Link>
          </Button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Disc3}
          title="아직 릴리즈가 없습니다"
          description="이 사이트에서 발매한 음원을 추가하세요."
          action={
            <Button asChild>
              <Link href={`/${site}/releases/new`}>새 릴리즈</Link>
            </Button>
          }
        />
      ) : (
        <ReleasesTable rows={rows} basePath={`/${site}/releases`} />
      )}
    </div>
  );
}
