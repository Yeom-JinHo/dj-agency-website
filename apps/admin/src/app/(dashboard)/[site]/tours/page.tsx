import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { adminListArtists, adminListTours } from "@repo/content/admin-queries";
import { siteSlugSchema } from "@repo/content/schema";

import { mediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// 인증 세션(쿠키)에 의존하므로 정적 프리렌더 제외.
export const dynamic = "force-dynamic";

/**
 * status 뱃지(라벨 + 시맨틱 컬러). soldout=amber·cancelled=red, scheduled만 중립.
 */
const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  scheduled: {
    label: "예정",
    className: "border-border text-muted-foreground",
  },
  soldout: {
    label: "매진",
    className:
      "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  cancelled: {
    label: "취소",
    className: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400",
  },
};

/**
 * event_date(timestamptz) → `2026-10-03 21:00` 고정 포맷. Asia/Seoul로 타임존을
 * 고정해 서버 실행 환경 TZ와 무관하게 KST 벽시계 시각을 표시(tour-form의
 * isoToLocalInput과 일관 — 단일 KST 편집자 기준). 부분 조합이라 로케일 비종속.
 */
function formatEventDate(value: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")} ${get("hour")}:${get("minute")}`;
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">투어</h1>
          <p className="text-muted-foreground text-sm">예정된 공연 일정.</p>
        </div>
        <Button asChild>
          <Link href={`/${site}/tours/new`}>새 투어</Link>
        </Button>
      </div>

      {tours.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          아직 투어가 없습니다. &ldquo;새 투어&rdquo;로 추가하세요.
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14"></TableHead>
                <TableHead>제목</TableHead>
                <TableHead>아티스트</TableHead>
                <TableHead>장소</TableHead>
                <TableHead>일시</TableHead>
                <TableHead>상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tours.map((tour) => {
                const thumb = mediaUrl(tour.posterPath);
                // 지난 공연은 시각적으로 muted 처리(§13 'past'는 event_date로 유도).
                const isPast = new Date(tour.eventDate).getTime() < now;
                const venueCity = [tour.venue, tour.city]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <TableRow
                    key={tour.id}
                    className={`relative cursor-pointer${isPast ? " opacity-50" : ""}`}
                  >
                    <TableCell>
                      <div className="bg-muted flex size-9 items-center justify-center overflow-hidden rounded-md">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt=""
                            width={36}
                            height={36}
                            className="size-full object-cover"
                          />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/${site}/tours/${tour.id}`}
                        className="after:absolute after:inset-0"
                      >
                        {tour.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {(tour.artistId && artistName.get(tour.artistId)) ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {venueCity || "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground tabular-nums">
                      {formatEventDate(tour.eventDate)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`rounded border px-1.5 py-0.5 text-xs ${
                          STATUS_BADGE[tour.status]?.className ??
                          "border-border text-muted-foreground"
                        }`}
                      >
                        {STATUS_BADGE[tour.status]?.label ?? tour.status}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
