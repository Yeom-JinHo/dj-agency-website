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
    headClassName: "w-20",
    cell: (row) => (
      <div className="bg-muted flex size-16 items-center justify-center overflow-hidden rounded-md">
        {row.thumb ? (
          <Image
            src={row.thumb}
            alt=""
            width={64}
            height={64}
            className="size-full object-cover"
          />
        ) : (
          // 이미지가 없으면 빈 회색 박스만 남아 "미등록"인지 "로딩 실패"인지 읽히지 않는다.
          // 의미를 나르는 아이콘이라 장식으로 면제되지 않는다 — /60(bg-muted 위 2.21:1)은
          // 1.4.11의 3:1에 미달해 불투명 muted-foreground(4.35:1)로 올린다.
          <ThumbIcon className="text-muted-foreground size-6" aria-hidden />
        )}
      </div>
    ),
  },
  {
    id: "title",
    header: "제목",
    // 앵커 컬럼의 바닥 폭(투어·아티스트 목록과 같은 w-96 = 384px).
    // 스페이서 컬럼(data-table.tsx)이 잉여를 전부 가져가면서 폭 미지정 컬럼은 내용 폭까지
    // 좁아진다. 제목을 그대로 두면 짧은 제목에서 컬럼이 120px 남짓으로 줄어 상한을 준
    // 수정일(112px)과 대등해지고, 바로 앞 커밋에서 세운 "제목이 가장 넓다"가 무너진다.
    // 상한이 아니라 바닥이라 긴 제목은 nowrap 셀이 그만큼 늘린다.
    headClassName: "w-96",
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
  // 아래 세 컬럼에 폭 상한을 두는 이유(공통):
  // 표가 table-layout auto라 폭을 지정하지 않은 컬럼끼리 남는 공간을 내용 길이에 비례해
  // 나눠 갖는다. 그 결과 실측(VFL 1134px)에서 값이 가장 짧은 컬럼들이 정작 행의 앵커인
  // 제목보다 넓어졌다 — 제목 239 / 아티스트 201 / 발매일 172 / 정렬 순서 210 / 수정일 232.
  // 특히 정렬 순서는 값이 한 자리 숫자(0~4)인데 헤더 네 글자가 만든 폭에 남는 공간까지
  // 얹혀 210px였고, 발매일은 5행 전부 "—"인 채로 172px를 썼다.
  // 값의 최대 폭이 정해져 있는 컬럼을 그 폭에 묶어두면 남는 공간이 제목으로 흘러가
  // "가장 중요한 컬럼이 가장 넓다"가 배치로도 성립한다. 셀이 nowrap이라 상한은 절단이
  // 아니라 하한 보장에 가깝다 — 값이 더 길어지면 컬럼이 그만큼 늘어난다.
  {
    id: "releaseDate",
    header: "발매일",
    // 지금 전 행이 "—"라고 컬럼을 지우지는 않는다. 릴리즈 폼에 입력칸이 살아 있는
    // 필드라 비어 있는 건 데이터 문제이고, 컬럼을 지우면 "비었다"는 사실 자체가
    // 목록에서 보이지 않게 된다. 값은 formatDate가 만드는 `2026-10-03` 고정 폭이라
    // w-28(112px)이면 헤더("발매일" + 정렬 아이콘)까지 함께 들어간다.
    headClassName: "w-28",
    cellClassName: "text-muted-foreground tabular-nums",
    cell: (row) => row.releaseDate ?? "—",
    sortValue: (row) => row.releaseDate ?? "",
  },
  {
    id: "sortOrder",
    // 아티스트 목록·폼 라벨과 같은 말("정렬 순서") — 화면마다 다른 이름을 쓰지 않는다.
    header: "정렬 순서",
    // 아티스트 목록의 같은 컬럼과 같은 w-24(96px) — 헤더 네 글자 + 정렬 아이콘이
    // 사실상 이 폭을 요구하므로 더 줄일 수 없고, 두 목록이 같은 값을 같은 폭으로 보인다.
    // 컬럼 자체는 유지한다: 기본 정렬(defaultSort)이 이 값이라 헤더가 사라지면
    // "지금 이 순서다"를 알릴 자리가 없어진다.
    headClassName: "w-24",
    cellClassName: "text-muted-foreground tabular-nums",
    cell: (row) => row.sortOrder,
    sortValue: (row) => row.sortOrder,
  },
  {
    id: "updatedAt",
    header: "수정일",
    // 발매일과 같은 formatDate 출력이라 같은 폭으로 묶는다 — 날짜 두 컬럼의 폭이
    // 다르면 같은 종류의 값인데 다른 축처럼 보인다.
    headClassName: "w-28",
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
