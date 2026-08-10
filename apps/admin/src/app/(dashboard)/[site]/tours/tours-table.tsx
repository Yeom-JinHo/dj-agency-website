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
    cellClassName: "font-medium",
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
