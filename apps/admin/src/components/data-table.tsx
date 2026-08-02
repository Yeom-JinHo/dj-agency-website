"use client";

import { useMemo, type ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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
 * `stretched`는 행 전체를 덮는 링크를 그 셀에 넣는다(행당 하나).
 */
export type DataTableColumn<T> = {
  id: string;
  header: string;
  headClassName?: string;
  cellClassName?: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  stretched?: boolean;
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
  rowClassName,
  searchText,
  searchPlaceholder,
}: {
  rows: T[];
  columns: DataTableColumn<T>[];
  rowHref: (row: T) => string;
  rowClassName?: (row: T) => string | undefined;
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

      {/* 목록 자체가 빈 경우는 상위 페이지가 EmptyState로 먼저 걸러내므로, 여기서 0건은 곧 검색 0건이다.
          EmptyState가 점선 테두리를 이미 갖고 있어 테두리가 겹치지 않도록 border 컨테이너를 아예 대체한다. */}
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
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
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
                          className="hover:text-foreground focus-visible:ring-ring/50 -mx-1 inline-flex items-center gap-1 rounded px-1 outline-none focus-visible:ring-[3px]"
                          aria-label={`${column.header} 기준 ${nextAction}`}
                        >
                          {column.header}
                          <SortIcon
                            className={cn(
                              "size-3.5",
                              active ? "" : "text-muted-foreground/50",
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
                  className={cn("relative cursor-pointer", rowClassName?.(row))}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} className={column.cellClassName}>
                      {column.stretched ? (
                        <Link
                          href={withSearch(rowHref(row), searchParams)}
                          className="after:absolute after:inset-0"
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
