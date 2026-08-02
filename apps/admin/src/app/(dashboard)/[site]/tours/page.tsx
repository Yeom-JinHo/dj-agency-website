import Link from "next/link";
import { notFound } from "next/navigation";
import { adminListArtists, adminListTours } from "@repo/content/admin-queries";
import { siteSlugSchema } from "@repo/content/schema";
import { MapPin } from "lucide-react";

import { mediaUrl } from "@/lib/media";
import { formatDateTime } from "@/lib/format-date";
import { EmptyState } from "@/components/empty-state";
import { EntityBreadcrumb } from "@/components/entity-breadcrumb";
import { NewEntityButton } from "@/components/new-entity-button";
import { Button } from "@/components/ui/button";
import { ToursTable, type TourRow } from "./tours-table";

export default async function ToursPage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site: siteParam } = await params;
  const parsed = siteSlugSchema.safeParse(siteParam);
  if (!parsed.success) notFound();
  const site = parsed.data;

  // 목록은 소속 사이트 것만(adminListTours(site)). artistId→name 표시는 같은 사이트
  // 로스터에서 조립(Tour 스키마는 artistId만 담고 이름을 조인하지 않음).
  const [tours, artists] = await Promise.all([
    adminListTours(site),
    adminListArtists(site),
  ]);
  const artistName = new Map(artists.map((a) => [a.id, a.name]));
  const now = Date.now();

  // 검색·정렬은 클라이언트가 하므로 셀에 쓰는 필드만 직렬화해 넘긴다.
  const rows: TourRow[] = tours.map((tour) => ({
    id: tour.id,
    title: tour.title,
    artist: (tour.artistId && artistName.get(tour.artistId)) || null,
    venueCity: [tour.venue, tour.city].filter(Boolean).join(", "),
    eventDate: formatDateTime(tour.eventDate),
    status: tour.status,
    isPast: new Date(tour.eventDate).getTime() < now,
    thumb: mediaUrl(tour.posterPath),
  }));

  return (
    <div className="space-y-6">
      <EntityBreadcrumb site={site} category="tours" />
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">투어</h1>
          <p className="text-muted-foreground text-sm">예정된 공연 일정.</p>
        </div>
        {/* 빈 상태에서는 CTA가 EmptyState 안에 있으므로 우상단 버튼을 숨긴다. */}
        {rows.length > 0 ? (
          <NewEntityButton href={`/${site}/tours/new`}>새 투어</NewEntityButton>
        ) : null}
      </div>

      {rows.length === 0 ? (
        <EmptyState
          icon={MapPin}
          title="아직 투어가 없습니다"
          description="예정된 공연 일정을 추가하세요."
          action={
            // 목록 자체가 비어 있으면 돌아갈 검색 상태가 없으므로 쿼리를 싣지 않는다
            // (우상단 버튼과 달리 평범한 Link).
            <Button asChild>
              <Link href={`/${site}/tours/new`}>새 투어</Link>
            </Button>
          }
        />
      ) : (
        <ToursTable rows={rows} basePath={`/${site}/tours`} />
      )}
    </div>
  );
}
