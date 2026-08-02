/**
 * 목록의 검색·정렬 쿼리(`q`/`sort`/`dir`)를 경로 뒤에 다시 붙인다.
 * 목록 → 상세 → 목록 복귀 동선에서 쿼리를 계속 실어 나르는 지점이
 * 3개 폼 + 3개 삭제 버튼 + 행 링크로 7곳이라, "빈 쿼리면 `?`를 붙이지 않는다"는
 * 규칙이 그만큼 복제되는 걸 막으려고 한 곳에 둔다.
 *
 * 개별 키를 재조립하지 않고 `toString()`을 통째로 옮기므로 나중에 파라미터가
 * 늘어도 자동으로 따라온다. next/navigation의 ReadonlyURLSearchParams는
 * URLSearchParams를 상속하므로 그대로 받는다.
 */
export function withSearch(path: string, search: URLSearchParams): string {
  const qs = search.toString();
  return qs ? `${path}?${qs}` : path;
}
