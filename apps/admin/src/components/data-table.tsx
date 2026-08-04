"use client";

import {
  useEffect,
  useMemo,
  useRef,
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
  defaultSort,
}: {
  rows: T[];
  columns: DataTableColumn<T>[];
  rowHref: (row: T) => string;
  searchText: (row: T) => string;
  searchPlaceholder: string;
  /** 정렬 미선택 상태에서 서버가 준 순서(예: sort_order asc). 지정하면 그 컬럼에
   *  무채색 방향 화살표 + aria-sort로 "지금 이 순서다"를 알린다 — 이전엔 기본
   *  정렬 기준이 시각·보조기기 어디에도 드러나지 않았다. */
  defaultSort?: { id: string; dir: "asc" | "desc" };
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
  // 스크롤포트가 페이지가 아니라 표 컨테이너라, 스크롤 위치를 되감으려면 그 div를 잡아야 한다.
  const tableContainer = useRef<HTMLDivElement>(null);

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

  /**
   * 결과 순서가 바뀌면 표를 첫 행으로 되감는다. 표 영역이 자기 스크롤포트가 된 뒤로는
   * 목록 중간에서도 헤더가 보여 거기서 정렬을 걸 수 있는데(sticky 이전에는 헤더가 화면
   * 밖이라 이 동선 자체가 없었다), scrollTop이 그대로 남으면 새로 1등이 된 행이 화면
   * 위쪽 보이지 않는 곳에 놓인다. 정렬한 사람이 보려던 것은 대개 그 첫 행이다.
   *
   * 브라우저는 내용이 줄면 scrollTop을 최대값으로 깎아줄 뿐이라(실측: 40행에서 3행으로
   * 좁히면 600 → 0) 결과가 여전히 길 때는 중간에 머문다. 그래서 검색어 변경도 같이 되감는다.
   * 사용자 조작(정렬 클릭·타이핑)에서만 부르고 effect로 걸지 않는다 — URL로 되돌아오는
   * 뒤로가기까지 되감으면 브라우저의 스크롤 복원을 덮어쓴다.
   */
  function resetScroll() {
    if (tableContainer.current) tableContainer.current.scrollTop = 0;
  }

  // 오름차순 → 내림차순 → 해제 3단 순환. sort_order가 실제 사이트 노출 순서라
  // 정렬을 걸어본 뒤 원래 순서로 돌아올 수단이 반드시 있어야 한다.
  // 해제는 두 값을 null로 — clearOnDefault 기본값 덕에 URL에서 파라미터가 사라진다.
  function toggleSort(id: string) {
    resetScroll();
    if (sortId !== id) {
      // 기본 정렬 컬럼은 이미 그 방향으로 놓여 있다 — 첫 클릭이 같은 순서를
      // 반복하지 않고 반대 방향부터 시작하게 한다.
      const startDir =
        !sortId && defaultSort?.id === id
          ? defaultSort.dir === "asc"
            ? "desc"
            : "asc"
          : "asc";
      setSort({ sort: id, dir: startDir });
    } else if (sortDir === "asc") {
      setSort({ sort: id, dir: "desc" });
    } else {
      setSort({ sort: null, dir: null });
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            type="search"
            value={query}
            onChange={(e) => {
              resetScroll();
              setQuery(e.target.value);
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="pl-9"
          />
        </div>
        {/* 총 건수. 예전엔 목록 규모를 알려면 끝까지 스크롤하는 수밖에 없었다.
            검색창 바로 옆에 두는 이유는 이 숫자를 바꾸는 유일한 조작이 검색이기 때문이다 —
            제목 옆(상위 page 소유)이나 표 위에 두면 원인과 결과가 떨어진다.
            검색 중엔 분모를 남긴 "N건 중 M건"으로 간다. 결과 수만 보이면 방금 몇 건에서
            걸러낸 건지 알 수 없어, 정작 "규모를 알려달라"는 원래 문제가 검색 중에 되살아난다.
            전부 일치해 "38건 중 38건"이 되는 경우도 그대로 둔다 — 타이핑하는 동안 문구 형식이
            일치 개수에 따라 튀는 편이 숫자가 겹치는 것보다 읽기 나쁘다.
            라이브 리전이 아니므로 여기 숫자가 바뀌어도 발화되지 않는다. 검색 결과 발화는
            아래 sr-only 리전이 계속 전담하고(빈 검색어는 침묵), 이 텍스트는 스크린리더가
            훑을 때 "전체 몇 건인지"를 더해줄 뿐이라 중복 발화가 생기지 않는다. */}
        <p className="text-muted-foreground shrink-0 text-sm tabular-nums">
          {trimmedQuery
            ? `${rows.length}건 중 ${resultCount}건`
            : `총 ${rows.length}건`}
        </p>
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
              셸 헤더가 sticky가 되어도 이 값은 유효하다: sticky는 fixed와 달리 흐름에서 자리를 계속
              차지하므로 표 위 크롬 높이가 변하지 않는다.

              높이는 실측으로 잡았다(1440 폭, 4개 목록 동일) — 컨테이너 top 248 + 테두리 상하 2
              + 콘텐츠 컬럼 p-6 하단 24 = 274px = 17.125rem. 화면 높이·데이터 양과 무관한 상수라
              한 번 맞으면 계속 맞는다. 처음 어림잡은 17rem은 2px 모자랐고, 그 2px 때문에 문서가
              스크롤 가능한 채로 남아 트랙패드에서 목록이 미세하게 덜컹였다(하단 여백도 22px로
              나머지 24px 패딩과 어긋났다). 값을 줄이는 쪽은 이렇게 이중 스크롤을 만들고,
              늘리는 쪽은 아래 여백만 남기므로 흔들릴 때는 늘리는 쪽으로 갈 것.

              scroll-pt-12: scroll-padding-top은 스크롤포트끼리 상속되지 않아, html에 걸어둔 값이
              이 컨테이너에는 닿지 않는다. 안에서 scrollIntoView가 불리면 대상 행이 sticky 헤더
              뒤로 숨으므로 헤더 높이(40px)만큼 밀어낸다. 8px을 더 얹어 48px로 두는 건 셀 패딩(p-2)과
              같은 리듬으로 헤더 아래 한 칸 띄우기 위해서다 — 행 링크의 포커스 링 3px도 이 여유 안에 든다. */}
          <Table
            containerRef={tableContainer}
            containerClassName="max-h-[calc(100svh-17.125rem)] scroll-pt-12"
          >
            {/* 세로 테두리는 border-collapse 테이블에서 셀이 아니라 표 격자에 속해 sticky를 따라오지
                않는다. 그래서 헤더 아래 선은 tr의 border-b가 아니라 th의 inset 그림자로 그린다.
                z-10 — 이 컨테이너 안에서 행 위에만 있으면 되고, dialog·select(z-50)와 #289 안내(z-100)
                아래에 남는다. */}
            <TableHeader className="[&_th]:bg-background [&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:shadow-[inset_0_-1px_0_var(--border)] [&_tr]:border-b-0">
              <TableRow>
                {columns.map((column) => {
                  const active = sortId === column.id;
                  // 정렬 미선택 시 서버 기본 순서를 대표하는 컬럼 — 명시 정렬(primary)과
                  // 구분되는 무채색 화살표로 "지금 이 순서"만 알린다.
                  const defaulted =
                    !sortId && !!column.sortValue && defaultSort?.id === column.id;
                  const defaultDir = defaultSort?.dir ?? "asc";
                  const SortIcon = active
                    ? sortDir === "asc"
                      ? ArrowUp
                      : ArrowDown
                    : defaulted
                      ? defaultDir === "asc"
                        ? ArrowUp
                        : ArrowDown
                      : ChevronsUpDown;
                  // 라벨은 현재 상태가 아니라 클릭 시 일어날 다음 동작을 읽어준다.
                  // 기본 정렬 컬럼은 이미 그 방향이므로 첫 동작이 반대 방향이다(toggleSort 참고).
                  const nextAction = active
                    ? sortDir === "asc"
                      ? "내림차순 정렬"
                      : "정렬 해제"
                    : defaulted && defaultDir === "asc"
                      ? "내림차순 정렬"
                      : "오름차순 정렬";
                  // 정렬 불가 컬럼은 aria-sort 자체를 달지 않는다("none"은
                  // "정렬 가능하지만 지금은 미정렬"이라는 뜻이라 오독을 만든다).
                  const ariaSort = !column.sortValue
                    ? undefined
                    : active
                      ? sortDir === "asc"
                        ? "ascending"
                        : "descending"
                      : defaulted
                        ? defaultDir === "asc"
                          ? "ascending"
                          : "descending"
                        : "none";
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
                        // 링은 링크 크기 그대로 둔다(헤더 정렬 버튼과 같은 링 어휘) —
                        // 히트 영역은 여전히 행 전체지만, 링이 말해야 하는 건 "지금 무엇에
                        // 포커스가 있는가"이고 그건 이 링크다. 대신 행 전체가 대상이라는
                        // 사실은 TableRow의 has-[a:focus-visible]이 hover와 같은 틴트·레일로
                        // 말한다 — 그래야 마우스 어포던스와 키보드 어포던스가 어긋나지 않는다.
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
