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
    headClassName: "w-24",
    cell: (row) => (
      <div className="bg-muted flex size-20 items-center justify-center overflow-hidden rounded-md">
        {row.thumb ? (
          // 세로 원본(1200×1800)의 중앙 크롭은 전신샷에서 얼굴을 잘라낸다(VARO) —
          // 인물 사진은 얼굴이 상단에 오므로 크롭 기준점을 20%로 올린다.
          <Image
            src={row.thumb}
            alt=""
            width={80}
            height={80}
            className="size-full object-cover object-[50%_20%]"
          />
        ) : (
          // 이미지가 없으면 빈 회색 박스만 남아 "미등록"인지 "로딩 실패"인지 읽히지 않는다.
          // 의미를 나르는 아이콘이라 장식으로 면제되지 않는다 — /60(bg-muted 위 2.21:1)은
          // 1.4.11의 3:1에 미달해 불투명 muted-foreground(4.35:1)로 올린다.
          <ThumbIcon className="text-muted-foreground size-8" aria-hidden />
        )}
      </div>
    ),
  },
  {
    id: "name",
    header: "이름",
    // 앵커 컬럼의 확정 폭(릴리즈·투어 목록과 같은 w-96 = 384px). table-fixed라 이 값이
    // 그대로 서고 잉여는 스페이서가 가져간다(data-table.tsx). 목록마다 앵커 폭이 다르면
    // 사이트를 옮길 때마다 행의 리듬이 바뀌므로 세 목록이 같은 값을 쓴다.
    // 384px을 고른 근거: 실측에서 이름 최장값(시드 기준 "Take Note & LOOZBONE" 20자)이
    // 절반 남짓만 쓴다. 여유를 이만큼 두는 건 DB에 시드보다 많은 행(celebrate 38건)이 있어
    // 최장값을 코드에서 확인할 수 없기 때문이고, 남는 여백은 스페이서가 아니라 여기 두는 편이
    // 낫다 — 잘림이 먼저 생기는 컬럼이 하필 행의 앵커면 목록 자체가 못 쓰게 된다.
    headClassName: "w-96",
    // 넘치면 꼬리를 접는다(사유는 data-table.tsx의 table-fixed 주석).
    cellClassName: "font-medium overflow-hidden text-ellipsis",
    cell: (row) => row.name,
    // slug는 독립 컬럼(291px)이었는데, 실측에서 VFL 6/6행은 이름과 완전히 같았고
    // (`Sielo`/`Sielo`) celebrate 38/38행은 소문자로 바꾼 것뿐이었다(`SAM`/`sam`).
    // 대부분의 행에서 옆칸과 구분되지 않는 값이 표 폭의 1/4을 쓰고 있었다.
    //
    // 그렇다고 지우지는 않는다 — slug는 생성 후 바꿀 수 없는 키이자 VFL 공개 주소
    // (/artist/{slug})라, 목록에서 "이 아티스트가 어느 주소로 나가는가"를 확인할 유일한
    // 자리다. 그래서 컬럼에서 이름 셀의 보조 줄로 강등한다. 가로는 한 칸을 통째로
    // 돌려주고, 세로는 공짜다 — 이 목록의 행 높이는 80px 썸네일이 이미 정해놨고 이름은
    // 그 안에서 한 줄만 쓰고 있었다. 이름과 slug가 위아래로 붙으면 "이름 → 주소" 대응도
    // 좌우로 떨어져 있을 때보다 오히려 읽기 쉽다.
    //
    // 검색은 그대로 slug를 포함하므로 placeholder("이름·slug로 검색")도 손대지 않는다 —
    // 값이 여전히 화면에 보이고 여전히 검색된다.
    //
    // 기각한 안:
    // - 컬럼 제거: 공개 주소를 목록에서 확인할 수단이 사라진다(상세 폼에만 남는다).
    // - 폭만 축소: 값이 이름의 복사본처럼 보이는 문제는 폭을 줄여도 그대로 남고,
    //   대신 "자기 컬럼을 가질 만큼 중요한 값"이라는 잘못된 위계만 유지된다.
    // - 정렬 기준 상실은 감수한다: slug ≈ 이름의 소문자라 slug 정렬은 이름 정렬과
    //   사실상 같은 결과였다.
    // w-fit: 블록 요소라 두면 상자가 셀 전폭까지 늘어난다(실측 2560에서 right=2319).
    // 값 하나를 나르는 줄이 셀 전폭을 차지하면 드래그 선택 범위가 글자 밖까지 잡혀
    // "이게 어디까지가 값인지"가 흐려진다. inline-block은 쓰지 않는다 — 앞의 <Link>가
    // 인라인이라 같은 줄에 붙어버려 두 줄 구성 자체가 깨진다. 블록은 유지하고 상자만 줄인다.
    // max-w-full + 자체 ellipsis: text-overflow는 상속되지 않아 셀에 건 처방이 이 블록에는
    // 닿지 않는다. w-fit은 내용이 길면 상자를 available까지 늘릴 뿐 잘라주지 않으므로,
    // 긴 slug가 이름 컬럼 밖으로 새지 않게 여기서 한 번 더 막는다.
    subCell: (row) => (
      <div className="text-muted-foreground mt-0.5 w-fit max-w-full overflow-hidden font-mono text-xs font-normal text-ellipsis">
        {row.slug}
      </div>
    ),
    sortValue: (row) => row.name,
    linked: true,
  },
  {
    id: "sortOrder",
    header: "정렬 순서",
    // w-24(96) → w-28(112). table-fixed에서 이 값은 하한이 아니라 확정 폭인데, 헤더
    // "정렬 순서" + 정렬 아이콘 + 셀 패딩이 실측 94px라 96px에는 여유가 2px뿐이었다
    // (헤더도 nowrap이라 넘치면 옆 컬럼 위로 흐른다). 릴리즈 목록의 같은 컬럼과 같은 값이다.
    headClassName: "w-28",
    cellClassName: "text-muted-foreground tabular-nums",
    cell: (row) => row.sortOrder,
    sortValue: (row) => row.sortOrder,
  },
  {
    id: "updatedAt",
    header: "수정일",
    // slug 컬럼이 돌려준 291px가 여기로 흘러가면 옮겨 담기만 한 셈이다. 폭을 지정하지
    // 않은 컬럼은 남는 공간을 나눠 갖는데(table-fixed에서는 스페이서와 반씩), 값은
    // formatDate가 만드는 `2026-10-03` 고정 폭이라 더 필요할 이유가 없다.
    // 릴리즈 목록의 같은 컬럼과 같은 w-28(112px)로 묶어 두 목록의 날짜 폭을 맞춘다.
    // 서버가 만든 고정 서식이라 확정 폭이어도 잘릴 일이 없어 ellipsis는 걸지 않는다.
    headClassName: "w-28",
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
