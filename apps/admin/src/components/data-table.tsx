"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronsUpDown, Search } from "lucide-react";

import { cn } from "@/lib/utils";
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

type SortState = { id: string; dir: "asc" | "desc" };

/**
 * 아티스트·릴리즈·투어 목록 공용 테이블(검색 + 헤더 정렬).
 * 서버 페이지가 전량 조회해 직렬화 가능한 rows를 넘기고 여기서 필터·정렬만 한다 —
 * 현 규모(사이트당 수십 행)에서 서버 왕복을 추가할 이유가 없고, 입력 즉시 반응한다.
 * 정렬 미선택 상태는 서버가 준 순서(sort_order)를 그대로 둔다.
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
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortState | null>(null);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return rows;
    return rows.filter((row) => searchText(row).toLowerCase().includes(keyword));
  }, [rows, query, searchText]);

  const visible = useMemo(() => {
    const column = columns.find((c) => c.id === sort?.id);
    const sortValue = column?.sortValue;
    if (!sort || !sortValue) return filtered;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const left = sortValue(a);
      const right = sortValue(b);
      if (typeof left === "number" && typeof right === "number") {
        return (left - right) * dir;
      }
      // 한글 제목이 섞이므로 코드포인트 비교 대신 ko 콜레이션.
      return String(left).localeCompare(String(right), "ko") * dir;
    });
  }, [filtered, sort, columns]);

  // 오름차순 → 내림차순 → 해제 3단 순환. sort_order가 실제 사이트 노출 순서라
  // 정렬을 걸어본 뒤 원래 순서로 돌아올 수단이 반드시 있어야 한다.
  function toggleSort(id: string) {
    setSort((prev) => {
      if (prev?.id !== id) return { id, dir: "asc" };
      if (prev.dir === "asc") return { id, dir: "desc" };
      return null;
    });
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

      <div className="rounded-lg border">
        {visible.length === 0 ? (
          <p className="text-muted-foreground p-6 text-center text-sm">
            검색 결과가 없습니다.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {columns.map((column) => {
                  const active = sort?.id === column.id;
                  const SortIcon = !active
                    ? ChevronsUpDown
                    : sort.dir === "asc"
                      ? ArrowUp
                      : ArrowDown;
                  // 라벨은 현재 상태가 아니라 클릭 시 일어날 다음 동작을 읽어준다.
                  const nextAction = !active
                    ? "오름차순 정렬"
                    : sort.dir === "asc"
                      ? "내림차순 정렬"
                      : "정렬 해제";
                  // 정렬 불가 컬럼은 aria-sort 자체를 달지 않는다("none"은
                  // "정렬 가능하지만 지금은 미정렬"이라는 뜻이라 오독을 만든다).
                  const ariaSort = !column.sortValue
                    ? undefined
                    : !active
                      ? "none"
                      : sort.dir === "asc"
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
                          href={rowHref(row)}
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
        )}
      </div>
    </div>
  );
}
