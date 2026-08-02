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
 * 지난 공연(isPast)은 status 컬럼이 아니라 event_date에서 파생되므로 여기 없다.
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
    cell: (row) => {
      const status = STATUS_BADGE[row.status];
      // 지난 공연에 '예정'은 이미 사실이 아니므로 '지남'이 그 자리를 대신하고,
      // 매진·취소는 공연이 지나도 남는 사실이라 '지남'과 나란히 둔다.
      const showStatus = !(row.isPast && row.status === "scheduled");
      return (
        <span className="flex items-center gap-1">
          {row.isPast ? <Badge>지남</Badge> : null}
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
}: {
  rows: TourRow[];
  basePath: string;
}) {
  return (
    <DataTable
      rows={rows}
      columns={columns}
      rowHref={(row) => `${basePath}/${row.id}`}
      // 지난 공연에 걸던 행 전체 opacity-50은 걷어냈다. 제목이 3.69:1, muted 셀이
      // 1.96:1까지 무너져 WCAG 1.4.3에 한참 못 미쳤는데, 지난 공연은 '안 읽어도 되는 것'이
      // 아니라 편집·삭제 대상이라 흐리게 만들 근거가 없다. 게다가 isPast가 시각 채널에만
      // 있어 스크린리더에는 아예 닿지 않았다 — 상태 컬럼의 '지남' 뱃지가 두 채널을 함께
      // 덮으므로 별도의 시각적 후퇴는 두지 않는다(후퇴 대신 라벨 추가로 방향을 뒤집었다).
      searchText={(row) => `${row.title} ${row.artist ?? ""} ${row.venueCity}`}
      searchPlaceholder="제목·아티스트·장소로 검색"
    />
  );
}
