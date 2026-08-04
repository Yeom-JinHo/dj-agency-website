"use client";

import Image from "next/image";

import { CATEGORY_ICONS } from "@/components/category-icons";
import { DataTable, type DataTableColumn } from "@/components/data-table";

// 썸네일이 비었을 때 채울 아이콘. 사이드바·사이트 홈 카드가 쓰는 카테고리 아이콘을
// 그대로 재사용해 "아티스트 = 사람"이라는 대응이 화면마다 어긋나지 않게 한다.
const ThumbIcon = CATEGORY_ICONS.artists;

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
    headClassName: "w-16",
    cell: (row) => (
      <div className="bg-muted flex size-12 items-center justify-center overflow-hidden rounded-md">
        {row.thumb ? (
          <Image
            src={row.thumb}
            alt=""
            width={48}
            height={48}
            className="size-full object-cover"
          />
        ) : (
          // 이미지가 없으면 빈 회색 박스만 남아 "미등록"인지 "로딩 실패"인지 읽히지 않는다.
          // 의미를 나르는 아이콘이라 장식으로 면제되지 않는다 — /60(bg-muted 위 2.21:1)은
          // 1.4.11의 3:1에 미달해 불투명 muted-foreground(4.35:1)로 올린다.
          <ThumbIcon className="text-muted-foreground size-5" aria-hidden />
        )}
      </div>
    ),
  },
  {
    id: "name",
    header: "이름",
    cellClassName: "font-medium",
    cell: (row) => row.name,
    sortValue: (row) => row.name,
    linked: true,
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
      // 서버 기본 순서(admin-queries의 sort_order asc)를 헤더에 드러낸다.
      defaultSort={{ id: "sortOrder", dir: "asc" }}
    />
  );
}
