import type { Metadata } from "next";
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
import { isSiteSlug, SITE_LABELS } from "@/lib/sites";
import { ToursTable, type TourRow } from "./tours-table";

// 제목 규약은 (dashboard)/page.tsx 주석 참고. params만 읽으므로 DB 조회는 늘지 않는다.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ site: string }>;
}): Promise<Metadata> {
  const { site } = await params;
  if (!isSiteSlug(site)) return { title: "ye0m2 admin" };
  return { title: `투어 · ${SITE_LABELS[site]} | ye0m2 admin` };
}

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
          {/* 위 브레드크럼이 이미 "여기가 어디인지"를 말하므로 h1은 최상위(대시보드·사이트 홈
              text-2xl)보다 한 단 작다 — 드릴다운할수록 제목이 작아져 방향감이 생긴다. */}
          <h1 className="text-xl font-semibold tracking-tight">투어</h1>
          {/* "예정된"을 빼는 이유 — 목록엔 지난 공연도 남고("지남" 뱃지) 대부분을
              차지하므로 설명이 내용과 어긋났다. 릴리즈("이 사이트의 릴리즈.")와 같은 틀. */}
          <p className="text-muted-foreground text-sm">이 사이트의 공연 일정.</p>
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
          description="이 사이트의 공연 일정을 추가하세요."
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
