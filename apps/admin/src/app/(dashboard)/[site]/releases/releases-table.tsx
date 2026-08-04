"use client";

import Image from "next/image";

import { CATEGORY_ICONS } from "@/components/category-icons";
import { DataTable, type DataTableColumn } from "@/components/data-table";

// 썸네일이 비었을 때 채울 아이콘. 사이드바·사이트 홈 카드가 쓰는 카테고리 아이콘을
// 그대로 재사용해 "릴리즈 = 디스크"라는 대응이 화면마다 어긋나지 않게 한다.
const ThumbIcon = CATEGORY_ICONS.releases;

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
    id: "releaseDate",
    header: "발매일",
    cellClassName: "text-muted-foreground tabular-nums",
    cell: (row) => row.releaseDate ?? "—",
    sortValue: (row) => row.releaseDate ?? "",
  },
  {
    id: "sortOrder",
    // 아티스트 목록·폼 라벨과 같은 말("정렬 순서") — 화면마다 다른 이름을 쓰지 않는다.
    header: "정렬 순서",
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
      // 서버 기본 순서(admin-queries의 sort_order asc)를 헤더에 드러낸다.
      defaultSort={{ id: "sortOrder", dir: "asc" }}
    />
  );
}
