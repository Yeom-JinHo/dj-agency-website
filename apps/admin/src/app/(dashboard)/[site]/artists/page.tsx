import Link from "next/link";
import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { siteSlugSchema } from "@repo/content/schema";
import { adminListArtists } from "@repo/content/admin-queries";

import { mediaUrl } from "@/lib/media";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { ArtistsTable, type ArtistRow } from "./artists-table";

// 인증 세션(쿠키)·비캐시 admin 쿼리에 의존하므로 정적 프리렌더 제외.
export const dynamic = "force-dynamic";

/**
 * 수정일 → `2026-10-03` 고정 포맷. Asia/Seoul 고정으로 서버 TZ와 무관하게 KST 날짜
 * 표시(releases·tours 목록과 동형). toLocaleDateString은 서버 TZ 의존이라 배제.
 */
function formatDate(value: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
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
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">아티스트</h1>
          <p className="text-muted-foreground text-sm">
            이 사이트에 소속된 아티스트 로스터.
          </p>
        </div>
        {/* 빈 상태에서는 CTA가 EmptyState 안에 있으므로 우상단 버튼을 숨긴다. */}
        {rows.length > 0 ? (
          <Button asChild>
            <Link href={`/${site}/artists/new`}>새 아티스트</Link>
          </Button>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={Users}
          title="아직 아티스트가 없습니다"
          description="이 사이트의 로스터에 첫 아티스트를 추가하세요."
          action={
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
