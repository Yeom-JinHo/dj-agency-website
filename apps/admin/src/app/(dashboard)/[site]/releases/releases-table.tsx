"use client";

import Image from "next/image";

import { DataTable, type DataTableColumn } from "@/components/data-table";

/**
 * 목록 셀에 쓰는 필드만 뽑은 직렬화 가능한 행. 날짜는 서버에서 KST로 포맷해
 * 문자열로 넘긴다(클라이언트 TZ에 따라 표시가 흔들리지 않게).
 */
export type ReleaseRow = {
  id: string;
  title: string;
  artist: string | null;
  releaseDate: string | null;
  sortOrder: number;
  updatedAt: string;
  thumb: string | null;
};

const columns: DataTableColumn<ReleaseRow>[] = [
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
    id: "releaseDate",
    header: "발매일",
    cellClassName: "text-muted-foreground tabular-nums",
    cell: (row) => row.releaseDate ?? "—",
    sortValue: (row) => row.releaseDate ?? "",
  },
  {
    id: "sortOrder",
    header: "정렬",
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

export function ReleasesTable({
  rows,
  basePath,
}: {
  rows: ReleaseRow[];
  basePath: string;
}) {
  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowHref={(row) => `${basePath}/${row.id}`}
      searchText={(row) => `${row.title} ${row.artist ?? ""}`}
      searchPlaceholder="제목·아티스트로 검색"
    />
  );
}
