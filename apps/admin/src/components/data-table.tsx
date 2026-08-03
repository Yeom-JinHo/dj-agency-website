"use client";

import {
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from "lucide-react";
import {
  parseAsString,
  parseAsStringLiteral,
  throttle,
  useQueryState,
  useQueryStates,
} from "nuqs";

import { withSearch } from "@/lib/list-search";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * 목록 테이블의 컬럼 정의. `sortValue`가 있는 컬럼만 헤더 클릭 정렬이 켜지고,
 * `linked`는 상세로 가는 실제 링크를 그 셀에 넣는다(행당 하나 — 행의 접근 가능한 진입점).
 */
export type DataTableColumn<T> = {
  id: string;
  header: string;
  headClassName?: string;
  cellClassName?: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  linked?: boolean;
};

const SORT_DIRS = ["asc", "desc"] as const;

/**
 * 아티스트·릴리즈·투어 목록 공용 테이블(검색 + 헤더 정렬).
 * 서버 페이지가 전량 조회해 직렬화 가능한 rows를 넘기고 여기서 필터·정렬만 한다 —
 * 현 규모(사이트당 수십 행)에서 서버 왕복을 추가할 이유가 없고, 입력 즉시 반응한다.
 * 정렬 미선택 상태는 서버가 준 순서(sort_order)를 그대로 둔다.
 *
 * 검색·정렬 상태는 URL 쿼리(`q`/`sort`/`dir`)에 산다. 편집 동선이
 * "목록에서 검색 → 항목 편집 → 저장 후 목록으로 복귀"라, 로컬 state면 복귀할 때마다
 * 검색어가 날아가 매 항목마다 다시 입력해야 했다. nuqs 기본값(shallow=true·
 * history=replace·clearOnDefault=true)이 그대로 필요한 동작이라 옵션은 건드리지 않는다 —
 * 서버 왕복 없이 필터링은 계속 클라이언트에서 돌고, 타이핑이 뒤로가기 스택을 쌓지 않는다.
 *
 * 다만 URL에 담는 것만으로는 절반이다 — 상세에서 저장·취소·삭제 후 목록으로 돌아오는 건
 * 뒤로가기가 아니라 router.push라 쿼리 없는 경로로 가버린다. 그래서 행 링크가 현재 쿼리를
 * 상세 URL까지 실어 보내고, 폼·삭제 버튼이 그걸 읽어 복귀 경로에 되붙인다.
 */
export function DataTable<T extends { id: string }>({
  rows,
  columns,
  rowHref,
  searchText,
  searchPlaceholder,
}: {
  rows: T[];
  columns: DataTableColumn<T>[];
  rowHref: (row: T) => string;
  searchText: (row: T) => string;
  searchPlaceholder: string;
}) {
  // 입력값 자체는 nuqs가 동기로 돌려주므로 타이핑은 즉시 반영되고, 늦춰지는 건 URL 기록뿐이다.
  // debounce 대신 throttle: 타이핑 도중 행을 클릭해 이탈해도 마지막 URL 반영이 300ms 안에 끝나
  // "검색어를 들고 돌아온다"는 목적이 깨지지 않는다.
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString
      .withDefault("")
      .withOptions({ limitUrlUpdates: throttle(300) }),
  );
  // 두 값이 한 번의 URL 갱신으로 같이 움직여야 해서 useQueryStates로 묶는다.
  const [{ sort: sortId, dir: rawDir }, setSort] = useQueryStates({
    sort: parseAsString,
    dir: parseAsStringLiteral(SORT_DIRS),
  });
  // dir이 빠진 URL(`?sort=name`)도 오름차순으로 읽는다 — 정렬 상태 판정을 여기 한 곳으로 모은다.
  const sortDir = sortId ? (rawDir ?? "asc") : null;
  // 행 링크에 실을 쿼리. 위 세 값을 다시 조립하지 않고 URL을 통째로 옮긴다 —
  // 나중에 파라미터가 늘어도 따라오고, nuqs가 쓴 URL이 곧 상세로 넘길 진실이다.
  const searchParams = useSearchParams();
  const router = useRouter();

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter((row) => searchText(row).toLowerCase().includes(keyword));
  }, [rows, query, searchText]);

  const visible = useMemo(() => {
    // 존재하지 않는 컬럼 id가 URL로 들어오면 sortValue가 undefined라 정렬이 조용히 무시된다.
    const column = columns.find((c) => c.id === sortId);
    const sortValue = column?.sortValue;
    if (!sortId || !sortValue) return filtered;
    const dir = sortDir === "desc" ? -1 : 1;
    return [...filtered].sort((a, b) => {
      const left = sortValue(a);
      const right = sortValue(b);
      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * dir;
      }
      // 한글 제목이 섞이므로 코드포인트 비교 대신 ko 콜레이션.
      return String(left).localeCompare(String(right), "ko") * dir;
    });
  }, [filtered, sortId, sortDir, columns]);

  // 검색 결과 변화는 화면 아래쪽에서만 일어나고 포커스는 입력에 머물러 있어, 라이브 리전이
  // 없으면 스크린리더 사용자에게 결과가 몇 건인지 전달되지 않는다.
  // 과다 발화는 두 겹으로 억제한다 — (1) 글자마다 낭독하면 입력을 방해하므로 타이핑이
  // 500ms 멎은 뒤의 최종 결과만 넣고(URL 반영 throttle 300ms보다 길게 잡아 중간 상태가
  // 새지 않게 한다), (2) 검색어가 비어 있는 전체 목록 상태는 "결과"가 아니므로 문구를
  // 비워 아무것도 알리지 않는다(빈 문자열로 되돌리는 것은 발화를 만들지 않는다).
  const trimmedQuery = query.trim();
  const resultCount = visible.length;
  const [announcement, setAnnouncement] = useState("");
  useEffect(() => {
    if (!trimmedQuery) {
      setAnnouncement("");
      return;
    }
    const timer = setTimeout(() => {
      setAnnouncement(
        resultCount === 0
          ? "검색 결과가 없습니다"
          : `${resultCount}건이 검색되었습니다`,
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [trimmedQuery, resultCount]);

  /**
   * 행 아무 데나 클릭하면 상세로 가는 편의 동선.
   * 예전에는 제목 셀 링크를 `after:inset-0`로 늘려 행 전체를 덮었는데, 그러면 링크가
   * slug·날짜 텍스트 위에 깔려 드래그 복사가 아예 되지 않고 행 안에 다른 조작(삭제·선택)을
   * 넣을 자리도 없었다. 그래서 진짜 <Link>는 제목 셀에만 두고(포커스·Enter·수식키 클릭·
   * 우클릭 새 탭이 전부 브라우저 기본 동작으로 남는다) 나머지 영역만 여기서 처리한다.
   */
  function handleRowClick(e: MouseEvent<HTMLTableRowElement>, row: T) {
    // 수식키 클릭은 새 탭·새 창을 여는 의도다 — GuardedLink와 같은 어휘로 비켜준다.
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    // 자체 동작이 있는 요소(제목 셀 링크 등)는 그쪽에 맡긴다 — 이중 이동 방지.
    if ((e.target as HTMLElement).closest("a,button,input,label,select")) return;
    // 드래그로 텍스트를 고른 뒤의 mouseup도 click으로 도착한다. 선택이 남아 있으면
    // 이동하지 않는다 — 복사하려던 순간 페이지가 바뀌면 덮개를 걷어낸 의미가 없다.
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) return;
    // 링크와 같은 경로로 보낸다(검색·정렬 쿼리를 상세까지 실어 나르는 동작 유지).
    router.push(withSearch(rowHref(row), searchParams));
  }

  // 오름차순 → 내림차순 → 해제 3단 순환. sort_order가 실제 사이트 노출 순서라
  // 정렬을 걸어본 뒤 원래 순서로 돌아올 수단이 반드시 있어야 한다.
  // 해제는 두 값을 null로 — clearOnDefault 기본값 덕에 URL에서 파라미터가 사라진다.
  function toggleSort(id: string) {
    if (sortId !== id) {
      setSort({ sort: id, dir: "asc" });
    } else if (sortDir === "asc") {
      setSort({ sort: id, dir: "desc" });
    } else {
      setSort({ sort: null, dir: null });
    }
  }

  return (
    <div className="space-y-3">
      <div className="relative max-w-xs">
        <Search
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="pl-9"
        />
      </div>

      {/* 결과 개수 알림 전용 리전(시각적으로 숨김). assertive는 타이핑 자체를 끊으므로 polite. */}
      <div aria-live="polite" className="sr-only">
        {announcement}
      </div>

      {/* 목록 자체가 빈 경우는 상위 페이지가 EmptyState로 먼저 걸러내므로, 여기서 0건은 곧 검색 0건이다.
          EmptyState가 점선 테두리를 이미 갖고 있어 테두리가 겹치지 않도록 border 컨테이너를 아예 대체한다.
          표 쪽 컨테이너의 shadow-sm은 배경에서 한 겹 띄우는 용도다 — 테두리만으로는 흰 배경 위 흰 표가
          평면에 그려진 선처럼 보여 "표 = 다룰 수 있는 면"이라는 감각이 약했다. overflow-hidden은 안쪽
          스크롤 컨테이너의 각진 모서리를 이 둥근 테두리로 잘라내기 위한 것이다 — sticky 헤더에 배경이
          생기면서 상단 두 모서리가 흰색으로 메워져 보였다. */}
      {visible.length === 0 ? (
        <EmptyState
          icon={Search}
          title="검색 결과가 없습니다"
          description={`'${query.trim()}'에 해당하는 항목이 없습니다. 다른 검색어로 찾아보세요.`}
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() => setQuery("")}
            >
              검색 지우기
            </Button>
          }
        />
      ) : (
        <div className="overflow-hidden rounded-lg border shadow-sm">
          {/* 목록이 길어지면 헤더가 화면 밖으로 나가 어느 컬럼인지 확인하려면 맨 위로 돌아가야 했다
              (아티스트 38건 기준 문서 높이 약 4화면). 표 영역 자체를 스크롤포트로 만들고 헤더를 그 안에 고정한다.
              이 방식을 고른 이유는 sticky 기준이 '상단 셸'이 아니라 '이 컨테이너'가 되기 때문이다 —
              셸 헤더가 sticky가 되든 아니든 top-0이 그대로 옳아서, 헤더 높이를 여기서 알 필요가 없다.
              높이는 표 위 크롬(셸 헤더 45 + 콘텐츠 패딩 24 + 브레드크럼·제목·검색 ~172 + 하단 여백 24 ≈ 265px)에서
              잡았다. 남는 쪽으로 반올림해 17rem을 뺀다 — 모자라면 페이지와 표가 같이 스크롤되는 이중 스크롤이
              되지만, 남으면 아래에 약간의 여백이 생길 뿐이다. 셸 헤더가 sticky가 되어도 이 값은 유효하다:
              sticky는 fixed와 달리 흐름에서 자리를 계속 차지하므로 표 위 크롬 높이가 변하지 않는다. */}
          <Table containerClassName="max-h-[calc(100svh-17rem)]">
            {/* 세로 테두리는 border-collapse 테이블에서 셀이 아니라 표 격자에 속해 sticky를 따라오지
                않는다. 그래서 헤더 아래 선은 tr의 border-b가 아니라 th의 inset 그림자로 그린다.
                z-10 — 이 컨테이너 안에서 행 위에만 있으면 되고, dialog·select(z-50)와 #289 안내(z-100)
                아래에 남는다. */}
            <TableHeader className="[&_th]:bg-background [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:shadow-[inset_0_-1px_0_var(--border)] [&_tr]:border-b-0">
              <TableRow>
                {columns.map((column) => {
                  const active = sortId === column.id;
                  const SortIcon = !active
                    ? ChevronsUpDown
                    : sortDir === "asc"
                      ? ArrowUp
                      : ArrowDown;
                  // 라벨은 현재 상태가 아니라 클릭 시 일어날 다음 동작을 읽어준다.
                  const nextAction = !active
                    ? "오름차순 정렬"
                    : sortDir === "asc"
                      ? "내림차순 정렬"
                      : "정렬 해제";
                  // 정렬 불가 컬럼은 aria-sort 자체를 달지 않는다("none"은
                  // "정렬 가능하지만 지금은 미정렬"이라는 뜻이라 오독을 만든다).
                  const ariaSort = !column.sortValue
                    ? undefined
                    : !active
                      ? "none"
                      : sortDir === "asc"
                        ? "ascending"
                        : "descending";
                  return (
                    <TableHead
                      key={column.id}
                      className={column.headClassName}
                      aria-sort={ariaSort}
                    >
                      {column.sortValue ? (
                        <button
                          type="button"
                          onClick={() => toggleSort(column.id)}
                          // 활성 컬럼은 primary로 물들여 "지금 이 기준으로 정렬 중"을
                          // 아이콘 모양 말고 색으로도 알린다(7.64:1). 활성일 때 hover가
                          // foreground로 되돌아가면 정렬 표시가 커서에 따라 깜빡이므로,
                          // hover 대비는 primary 안에서 흐린다.
                          className={cn(
                            "focus-visible:ring-ring/50 -mx-1 inline-flex items-center gap-1 rounded px-1 outline-none focus-visible:ring-[3px]",
                            active
                              ? "text-primary hover:text-primary/80"
                              : "hover:text-foreground",
                          )}
                          aria-label={`${column.header} 기준 ${nextAction}`}
                        >
                          {column.header}
                          {/* 미정렬 아이콘은 "이 컬럼은 정렬 가능하다"는 유일한 시각 어포던스다.
                              /50(흰 배경 1.96:1)은 1.4.11의 3:1에 한참 못 미쳐 불투명으로 올린다(4.74:1). */}
                          <SortIcon
                            className={cn(
                              "size-3.5",
                              // 활성일 땐 버튼의 primary를 그대로 물려받는다 —
                              // 여기서 다시 지정하면 hover 감쇠 때 라벨만 흐려진다.
                              active ? "" : "text-muted-foreground",
                            )}
                            aria-hidden
                          />
                        </button>
                      ) : (
                        column.header
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((row) => (
                <TableRow
                  key={row.id}
                  // 행 전체가 여전히 클릭 가능하므로 포인터 커서는 유지한다. 텍스트 위에서
                  // 커서가 I빔으로 바뀌지 않아도 드래그 선택 자체는 그대로 된다.
                  className="cursor-pointer"
                  onClick={(e) => handleRowClick(e, row)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.cellClassName}>
                      {column.linked ? (
                        // 히트 영역이 셀로 줄었으니 포커스 링도 링크 크기로 좁힌다
                        // (헤더 정렬 버튼과 같은 링 어휘).
                        <Link
                          href={withSearch(rowHref(row), searchParams)}
                          className="focus-visible:ring-ring/50 rounded-sm outline-none focus-visible:ring-[3px]"
                        >
                          {column.cell(row)}
                        </Link>
                      ) : (
                        column.cell(row)
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
