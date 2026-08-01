"use client";

import Image from "next/image";

import { DataTable, type DataTableColumn } from "@/components/data-table";

/**
 * 목록 셀에 쓰는 필드만 뽑은 직렬화 가능한 행. 일시는 서버에서 KST로 포맷하고
 * 지난 공연 판정(isPast)도 서버 시각으로 계산해 넘긴다(클라이언트 시계 의존 제거).
 */
export type TourRow = {
  id: string;
  title: string;
  artist: string | null;
  venueCity: string;
  eventDate: string;
  status: string;
  isPast: boolean;
  thumb: string | null;
};

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

const columns: DataTableColumn<TourRow>[] = [
  {
    id: "thumb",
    header: "",
    headClassName: "w-14",
    cell: (row) => (
      <div className="bg-muted flex size-9 items-center justify-center overflow-hidden rounded-md">
        {row.thumb ? (
          <Image
            src={row.thumb}
            alt=""
            width={36}
            height={36}
            className="size-full object-cover"
          />
        ) : null}
      </div>
    ),
  },
  {
    id: "title",
    header: "제목",
    cellClassName: "font-medium",
    cell: (row) => row.title,
    sortValue: (row) => row.title,
    stretched: true,
  },
  {
    id: "artist",
    header: "아티스트",
    cellClassName: "text-muted-foreground",
    cell: (row) => row.artist ?? "—",
    sortValue: (row) => row.artist ?? "",
  },
  {
    id: "venueCity",
    header: "장소",
    cellClassName: "text-muted-foreground",
    cell: (row) => row.venueCity || "—",
    sortValue: (row) => row.venueCity,
  },
  {
    id: "eventDate",
    header: "일시",
    cellClassName: "text-muted-foreground tabular-nums",
    cell: (row) => row.eventDate,
    sortValue: (row) => row.eventDate,
  },
  {
    id: "status",
    header: "상태",
    cell: (row) => (
      <span
        className={`rounded border px-1.5 py-0.5 text-xs ${
          STATUS_BADGE[row.status]?.className ??
          "border-border text-muted-foreground"
        }`}
      >
        {STATUS_BADGE[row.status]?.label ?? row.status}
      </span>
    ),
  },
];

export function ToursTable({
  rows,
  basePath,
}: {
  rows: TourRow[];
  basePath: string;
}) {
  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowHref={(row) => `${basePath}/${row.id}`}
      // 지난 공연은 시각적으로 muted 처리(§13 'past'는 event_date로 유도).
      rowClassName={(row) => (row.isPast ? "opacity-50" : undefined)}
      searchText={(row) => `${row.title} ${row.artist ?? ""} ${row.venueCity}`}
      searchPlaceholder="제목·아티스트·장소로 검색"
    />
  );
}
