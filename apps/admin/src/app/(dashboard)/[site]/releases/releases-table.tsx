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
          /* width/height는 렌더 크기(64)가 아니라 그 2배인 128이다. 종전 64는
             DPR 2 화면에서 실제로 64px 소스가 내려와(실측 naturalWidth 64) 아트워크가
             1배율로 무르게 떴다 — 아티스트 목록이 80px 박스에 128px 소스를 받아
             또렷한 것과 나란히 놓이면 릴리즈만 흐린 게 눈에 띈다. 썸네일의 역할이
             "잘못 올린 이미지가 발행 전에 잡히는 검증 게이트"인데 1배율은 그 목적을
             깎는다(원본은 1400×1400이라 소스가 모자란 게 아니었다).
             렌더 크기는 바깥 박스의 size-16이 잡으므로 이 값을 올려도 레이아웃은
             그대로다. srcset 후보 선택이 관측상 1x로 떨어지는 경우가 있어, 1x
             후보 자체를 128로 만들어 어느 쪽이 선택되든 2배율이 보장되게 한다. */
          <Image
            src={row.thumb}
            alt=""
            width={128}
            height={128}
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
    // 앵커 컬럼의 확정 폭(투어·아티스트 목록과 같은 w-96 = 384px). table-fixed라 이 값이
    // 그대로 서고 잉여는 스페이서가 가져간다(data-table.tsx).
    // 384px 근거: 실측에서 제목 최장값("Time For The Underground")이 189px로 절반이 남는다.
    // 여유를 이만큼 두는 건 릴리즈 제목이 자유 입력이고 DB에 시드 밖의 행이 있어서다 —
    // 잘림이 먼저 생기는 컬럼이 하필 행의 앵커면 목록 자체가 못 쓰게 된다.
    headClassName: "w-96",
    // 넘치면 꼬리를 접는다(사유는 data-table.tsx의 table-fixed 주석).
    cellClassName: "font-medium overflow-hidden text-ellipsis",
    cell: (row) => row.title,
    sortValue: (row) => row.title,
    linked: true,
  },
  {
    id: "artist",
    header: "아티스트",
    // table-fixed에서는 폭을 지정하지 않은 컬럼이 스페이서와 잔여를 반씩 나눠 가져
    // 넓은 화면에서 다시 벌어진다. 그래서 모든 데이터 컬럼에 폭을 준다.
    // w-64(256): 릴리즈의 아티스트는 로스터 FK가 아니라 자유 입력 크레딧이라 길다 —
    // 실측 최장값 "Take Note, Juntaro & LOOZBONE"이 225px로, 한 단계 아래인 w-56(224)이면
    // 실데이터가 이미 잘린다. 제목(384)보다는 확실히 좁게 둬 위계는 유지한다.
    headClassName: "w-64",
    cellClassName: "text-muted-foreground overflow-hidden text-ellipsis",
    cell: (row) => row.artist ?? "—",
    sortValue: (row) => row.artist ?? "",
  },
  // 아래 세 컬럼에 폭을 못 박는 이유(공통):
  // 예전에는 폭을 지정하지 않아 컬럼끼리 남는 공간을 내용 길이에 비례해 나눠 가졌다.
  // 그 결과 실측(VFL 1134px)에서 값이 가장 짧은 컬럼들이 정작 행의 앵커인 제목보다
  // 넓어졌다 — 제목 239 / 아티스트 201 / 발매일 172 / 정렬 순서 210 / 수정일 232.
  // 특히 정렬 순서는 값이 한 자리 숫자(0~4)인데 헤더 네 글자가 만든 폭에 남는 공간까지
  // 얹혀 210px였고, 발매일은 5행 전부 "—"인 채로 172px를 썼다.
  // 값의 최대 폭이 정해져 있는 컬럼을 그 폭에 묶어두면 남는 공간이 스페이서로 흘러가
  // "가장 중요한 컬럼이 가장 넓다"가 배치로도 성립한다.
  // 세 컬럼 모두 서버가 만든 고정 서식(formatDate `2026-10-03`, 정수)이라 길이가 데이터에
  // 따라 변하지 않는다 — 그래서 확정 폭이어도 잘릴 일이 없고, ellipsis도 걸지 않는다.
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
    // 아티스트 목록의 같은 컬럼과 같은 w-28(112px) — 두 목록이 같은 값을 같은 폭으로 보인다.
    // w-24(96)에서 올렸다: table-fixed에서 이 값은 확정 폭인데 헤더 "정렬 순서" + 정렬
    // 아이콘 + 셀 패딩이 실측 94px라 여유가 2px뿐이었다(헤더도 nowrap이라 넘치면 새어 나간다).
    // 컬럼 자체는 유지한다: 기본 정렬(defaultSort)이 이 값이라 헤더가 사라지면
    // "지금 이 순서다"를 알릴 자리가 없어진다.
    headClassName: "w-28",
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
