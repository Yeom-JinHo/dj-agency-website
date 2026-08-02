"use client";

import Image from "next/image";

import { DataTable, type DataTableColumn } from "@/components/data-table";

/**
 * 목록 셀에 쓰는 필드만 뽑은 직렬화 가능한 행. 날짜는 서버에서 KST로 포맷해
 * 문자열로 넘긴다(클라이언트 TZ에 따라 표시가 흔들리지 않게).
 */
export type ArtistRow = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  updatedAt: string;
  thumb: string | null;
};

const columns: DataTableColumn<ArtistRow>[] = [
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
    id: "name",
    header: "이름",
    cellClassName: "font-medium",
    cell: (row) => row.name,
    sortValue: (row) => row.name,
    stretched: true,
  },
  {
    id: "slug",
    header: "Slug",
    cellClassName: "text-muted-foreground font-mono",
    cell: (row) => row.slug,
    sortValue: (row) => row.slug,
  },
  {
    id: "sortOrder",
    header: "정렬 순서",
    headClassName: "w-24",
    cellClassName: "text-muted-foreground tabular-nums",
    cell: (row) => row.sortOrder,
    sortValue: (row) => row.sortOrder,
  },
  {
    id: "updatedAt",
    header: "수정일",
    cellClassName: "text-muted-foreground tabular-nums",
    cell: (row) => row.updatedAt,
    sortValue: (row) => row.updatedAt,
  },
];

export function ArtistsTable({
  rows,
  basePath,
}: {
  rows: ArtistRow[];
  basePath: string;
}) {
  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowHref={(row) => `${basePath}/${row.id}`}
      searchText={(row) => `${row.name} ${row.slug}`}
      searchPlaceholder="이름·slug로 검색"
    />
  );
}
