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
 * scheduled=primary(accent) — 색 조립은 Badge가 들고 여기는 의미만 정한다.
 * 지난 공연(isPast)은 status 컬럼이 아니라 event_date에서 파생되므로 여기 없다.
 */
const STATUS_BADGE: Record<
  string,
  { label: string; variant: ComponentProps<typeof Badge>["variant"] }
> = {
  // 예정만 accent — 이 목록에서 운영자가 가장 먼저 찾는 정보(다가오는 공연)라
  // 종료(무채색)와 색으로 갈라야 한다. designer 독립 리뷰에서도 같은 지적.
  scheduled: { label: "예정", variant: "accent" },
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
          // 의미를 나르는 아이콘이라 장식으로 면제되지 않는다 — /60(bg-muted 위 2.21:1)은
          // 1.4.11의 3:1에 미달해 불투명 muted-foreground(4.35:1)로 올린다.
          <ThumbIcon className="text-muted-foreground size-4" aria-hidden />
        )}
      </div>
    ),
  },
  {
    id: "title",
    header: "제목",
    // 앵커 컬럼의 확정 폭(릴리즈·아티스트 목록과 같은 w-96 = 384px). table-fixed라 이 값이
    // 그대로 서고 잉여는 스페이서가 가져간다(data-table.tsx).
    // 384px 근거: 실측에서 제목 최장값("WATERGATE — BERLIN")이 146px로 절반 넘게 남는다.
    // 여유를 이만큼 두는 건 제목이 자유 입력이고 DB에 시드 밖의 행이 있어서다 —
    // 잘림이 먼저 생기는 컬럼이 하필 행의 앵커면 목록 자체가 못 쓰게 된다.
    headClassName: "w-96",
    // 넘치면 꼬리를 접는다(사유는 data-table.tsx의 table-fixed 주석).
    cellClassName: "font-medium overflow-hidden text-ellipsis",
    // 지난 공연은 제목의 '색'만 muted로 내린다(굵기 font-medium은 그대로).
    // 뱃지만으로는 스캔이 안 됐다 — 상태 컬럼은 제목에서 약 986px 떨어져 있어 '지남'과
    // '예정'을 가르려면 우측 끝까지 시선을 옮겨 글자를 읽어야 했다. 판별 신호를 시선이
    // 이미 머무는 두 번째 컬럼으로 옮긴다. 메일함의 읽음/안읽음과 같은 어휘라 학습이 필요 없고,
    // 목록이 sort_order 순서라 지난 공연이 연속 블록이 아니라 흩어져 있어도 통한다.
    //
    // 굵기와 색이 각각 다른 축을 맡는다 — 굵기(500)는 '행 안에서 제목이 주인공'을
    // 모든 행에 공통으로 표시하고, 색만 행 간 지남/예정을 가른다. 처음엔 굵기까지
    // 400으로 내렸는데 그러면 지난 행의 제목이 장소·일시와 토큰까지 같아져 행 안에
    // 눈이 걸 앵커가 사라졌다(특정 공연을 찾을 때 제목을 훑을 수 없다).
    //
    // 4.74:1로 AA를 넘긴다. 걷어낸 opacity-50(제목 3.69:1)과 다른 점은 '가독성을 뺀 것'이
    // 아니라 '강조를 뺀 것'이라는 데 있다 — 지난 행의 제목이 도달하는 톤은 같은 행의
    // 아티스트·장소·일시가 이미 쓰는 바로 그 색이고, 예정 행(#0A0A0A)과는 상호 4.18:1로 갈린다.
    //
    // 상태 뱃지의 accent(위 STATUS_BADGE)와 겹치지 않는다 — 축이 다르다. 뱃지 색은 우측 끝
    // 상태 컬럼에서 '무엇인지'를 말하고, 제목 톤은 시선이 이미 머무는 자리에서 '어느 행인지'를
    // 가른다. 986px 거리 문제는 뱃지를 어떻게 칠해도 남으므로 둘 다 필요하다.
    //
    // 기각한 안들:
    // - 행 좌측 액센트 마커: 이 앱에 없는 새 어휘고, 행 hover 틴트·테이블 좌측 테두리와 겹친다.
    // - 일시 컬럼 톤차: 이미 muted-foreground(4.74:1)라 AA 바닥까지 여유가 0.24뿐이다.
    // - 뱃지 형태 차이(점선 테두리 등): 제목 톤이 이미 신호를 나르므로 같은 사실에 대한
    //   이중 보상일 뿐 새 정보가 없다.
    cell: (row) =>
      row.isPast ? (
        <span className="text-muted-foreground">{row.title}</span>
      ) : (
        row.title
      ),
    sortValue: (row) => row.title,
    linked: true,
  },
  {
    id: "artist",
    header: "아티스트",
    // table-fixed에서는 폭 미지정 컬럼이 스페이서와 잔여를 반씩 나눠 갖는다 — 모든 데이터
    // 컬럼에 폭을 준다. w-40(160)으로 릴리즈의 같은 컬럼(w-64)보다 좁게 두는 이유는 값의
    // 성격이 다르기 때문이다: 투어의 아티스트는 로스터 FK 이름 하나(짧다)이고, 릴리즈 쪽은
    // 자유 입력 크레딧("Take Note, Juntaro & LOOZBONE")이라 길다.
    // 현재 이 열을 켜는 사이트는 없지만(아래 showArtist), 켜졌을 때 1440에서도 가로 스크롤이
    // 생기지 않으려면 이 폭이어야 한다 — 나머지 컬럼 합 936 + 160 = 1096 ≤ 1134.
    headClassName: "w-40",
    cellClassName: "text-muted-foreground overflow-hidden text-ellipsis",
    cell: (row) => row.artist ?? "—",
    sortValue: (row) => row.artist ?? "",
  },
  {
    id: "venueCity",
    header: "장소",
    // 실측(juntaro 8행 전수)에서 이 셀은 제목의 구분자만 바꾼 재탕이었다 —
    // 제목 "LION — SEOUL" / 장소 "LION, SEOUL". 그런데도 컬럼을 지우지 않는다.
    //
    // 공개 사이트가 그리는 건 제목이 아니라 이쪽이기 때문이다. juntaro /tour는
    // city를 거대한 헤드라인으로, country·venue를 캡션으로 렌더하고 title은 어디에도
    // 쓰지 않는다(tour-list.tsx). 즉 제목은 admin 내부 라벨 겸 slug 소스일 뿐이고,
    // 목록에서 "실제로 공개되는 위치"를 말하는 컬럼은 이것 하나다. 지우면 운영자가
    // 목록에서 공개 화면의 주인공(도시)을 전혀 확인할 수 없게 된다.
    //
    // 중복도 구조가 강제한 게 아니다 — tourFormSchema.title은 자유 문자열이고
    // venue/city는 별개 컬럼이라, 제목을 "SPRING TOUR 2026"으로 적는 순간 중복은
    // 사라지고 이 컬럼만 위치를 말한다. 지금 겹치는 건 제목 작성 관습이지 필드의 결함이
    // 아니라, 릴리즈 발매일이 비어 있는 것과 같은 부류(데이터 문제)로 다룬다.
    //
    // 그래서 남기되 값이 감당할 수 있는 폭까지만 준다. 예전에는 폭을 지정하지 않아
    // 남는 공간을 내용 길이 비례로 나눠 갖았고, 그 결과 이 컬럼이 326px(표 폭의 29%)로
    // 제목(359px)과 거의 대등해져 "같은 값이 두 번" 하는 인상을 폭으로도 키우고 있었다.
    //
    // 기각한 안:
    // - 컬럼 제거: 위와 같이 공개 위치 정보가 목록에서 사라진다.
    // - 장소를 도시/국가로 쪼개 제목과 겹치지 않는 축을 만들기: 행 데이터(TourRow)가
    //   venue+city를 서버에서 이미 합쳐 오고 country는 아예 싣지 않아 서버 페이지까지
    //   함께 바꿔야 한다. 폭 문제와 별개 과제라 여기서는 손대지 않는다.
    // - 제목 아래 보조 줄로 강등: 같은 값이 위아래로 붙어 중복이 더 도드라진다.
    // w-48(192px)은 실측 최장값 "CLAIRE, AMSTERDAM"(138px)에 여유가 있다. table-fixed로
    // 바뀌면서 이 값은 상한이 아니라 확정 폭이 됐으므로 넘치면 꼬리를 접는다
    // (사유는 data-table.tsx의 table-fixed 주석).
    headClassName: "w-48",
    cellClassName: "text-muted-foreground overflow-hidden text-ellipsis",
    cell: (row) => row.venueCity || "—",
    sortValue: (row) => row.venueCity,
  },
  {
    id: "eventDate",
    header: "일시",
    // 값이 `2026-10-03 21:00` 고정 폭(약 150px)인데 286px를 쓰고 있었다.
    // w-40(160) → w-44(176): table-fixed에서 확정 폭이 되면서 여유가 10px뿐이라
    // 폰트 폴백(한글 없는 값이지만 Geist 미로드 시)만으로도 넘칠 수 있었다.
    // 여기에 ellipsis를 걸지 않는 이유는 값이 서버에서 만든 고정 서식이라 길이가
    // 데이터에 따라 변하지 않기 때문이다 — 잘릴 일이 없는 컬럼에 잘림 처방을 붙이지 않는다.
    headClassName: "w-44",
    cellClassName: "text-muted-foreground tabular-nums",
    cell: (row) => row.eventDate,
    sortValue: (row) => row.eventDate,
  },
  {
    id: "status",
    header: "상태",
    // table-fixed에서는 폭 미지정 컬럼이 스페이서와 잔여를 반씩 나눠 가므로 여기에도 폭을 준다.
    // w-32(128): 지난 매진 공연이 '종료'+'매진' 두 뱃지를 나란히 다는 최대 조합이고 실측 108px다.
    // 뱃지는 자유 입력이 아니라 정해진 라벨 집합이라 ellipsis는 걸지 않는다.
    headClassName: "w-32",
    cell: (row) => {
      const status = STATUS_BADGE[row.status];
      // 지난 공연에 '예정'은 이미 사실이 아니므로 '종료'가 그 자리를 대신하고,
      // 매진·취소는 공연이 지나도 남는 사실이라 '종료'와 나란히 둔다.
      // '지남'은 상태 라벨로 부자연스러워 '종료'로 바꿨다(designer 리뷰).
      const showStatus = !(row.isPast && row.status === "scheduled");
      return (
        <span className="flex items-center gap-1">
          {row.isPast ? <Badge>종료</Badge> : null}
          {/* 모르는 status가 들어오면 원문을 중립 뱃지로 그대로 노출한다(빈 셀보다 낫다). */}
          {showStatus ? (
            <Badge variant={status?.variant}>
              {status?.label ?? row.status}
            </Badge>
          ) : null}
        </span>
      );
    },
  },
];

export function ToursTable({
  rows,
  basePath,
  showArtist,
}: {
  rows: TourRow[];
  basePath: string;
  /** 아티스트를 관리하는 사이트인가(lib/sites.ts SITE_CATEGORY_SEGMENTS). */
  showArtist: boolean;
}) {
  // 아티스트를 관리하지 않는 사이트에선 열을 통째로 뺀다. 투어의 아티스트는 로스터 FK
  // 하나뿐이라(releases의 artist_credit 같은 자유 입력 대체가 없다) 폼에서 셀렉트를
  // 감춘 사이트에는 값을 넣을 수단이 아예 없어 항상 "—"인 열만 남는다.
  // 검색 문구도 함께 갈린다 — 없는 열을 검색 대상으로 안내하지 않는다.
  const visibleColumns = showArtist
    ? columns
    : columns.filter((c) => c.id !== "artist");

  return (
    <DataTable
      rows={rows}
      columns={visibleColumns}
      rowHref={(row) => `${basePath}/${row.id}`}
      // 지난 공연에 걸던 행 전체 opacity-50은 걷어냈다. 제목이 3.69:1, muted 셀이
      // 1.96:1까지 무너져 WCAG 1.4.3에 한참 못 미쳤는데, 지난 공연은 '안 읽어도 되는 것'이
      // 아니라 편집·삭제 대상이라 읽기 어렵게 만들 근거가 없다. 게다가 isPast가 시각
      // 채널에만 있어 스크린리더에는 아예 닿지 않았다.
      //
      // isPast는 이제 두 곳이 나눠 나른다 — 상태 컬럼의 '종료' 뱃지가 의미(스크린리더 포함)를,
      // 제목 셀의 강조 해제가 스캔을 맡는다. 뱃지만으로는 스캔이 안 됐다: 상태 컬럼은 제목에서
      // 약 986px 떨어져 있어 판별하려면 우측 끝까지 시선을 옮겨 글자를 읽어야 했다.
      // 행 단위 처리로 돌아가지 말 것 — 행 전체를 건드리면 이미 muted-foreground인
      // 아티스트·장소·일시가 AA 아래로 떨어진다. 강조를 가진 셀은 제목뿐이라 손댈 곳도 제목뿐이다.
      searchText={(row) =>
        showArtist
          ? `${row.title} ${row.artist ?? ""} ${row.venueCity}`
          : `${row.title} ${row.venueCity}`
      }
      searchPlaceholder={
        showArtist ? "제목·아티스트·장소로 검색" : "제목·장소로 검색"
      }
    />
  );
}
