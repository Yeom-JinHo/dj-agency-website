"use client";

import type { ComponentProps } from "react";
import Image from "next/image";

import { CATEGORY_ICONS } from "@/components/category-icons";
import { DataTable, type DataTableColumn } from "@/components/data-table";
import { Badge } from "@/components/ui/badge";

// 썸네일이 비었을 때 채울 아이콘. 사이드바·사이트 홈 카드가 쓰는 카테고리 아이콘을
// 그대로 재사용해 "투어 = 핀"이라는 대응이 화면마다 어긋나지 않게 한다.
const ThumbIcon = CATEGORY_ICONS.tours;

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
 * status → 뱃지 라벨 + 변형. soldout=amber(warning)·cancelled=red(danger),
 * scheduled만 중립 — 색 조립은 Badge가 들고 여기는 의미만 정한다.
 */
const STATUS_BADGE: Record<
  string,
  { label: string; variant: ComponentProps<typeof Badge>["variant"] }
> = {
  scheduled: { label: "예정", variant: "neutral" },
  soldout: { label: "매진", variant: "warning" },
  cancelled: { label: "취소", variant: "danger" },
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
        ) : (
          // 이미지가 없으면 빈 회색 박스만 남아 "미등록"인지 "로딩 실패"인지 읽히지 않는다.
          <ThumbIcon className="text-muted-foreground/60 size-4" aria-hidden />
        )}
      </div>
    ),
  },
  {
    id: "title",
    header: "제목",
    cellClassName: "font-medium",
    cell: (row) => row.title,
    sortValue: (row) => row.title,
    linked: true,
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
    // 모르는 status가 들어오면 원문을 중립 뱃지로 그대로 노출한다(빈 셀보다 낫다).
    cell: (row) => (
      <Badge variant={STATUS_BADGE[row.status]?.variant}>
        {STATUS_BADGE[row.status]?.label ?? row.status}
      </Badge>
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
