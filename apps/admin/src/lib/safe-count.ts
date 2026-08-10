/**
 * 카운트 조회 실패를 null로 흡수한다(대시보드·사이트 홈·삭제 파급 안내 공용).
 * 수치 하나 때문에 페이지 전체를 죽이지 않되, 무음으로 삼키면 RLS·네트워크 문제가
 * "그냥 숫자가 안 보임"으로 위장되므로 서버 로그에는 반드시 남긴다.
 *
 * 값 타입을 열어 둔 이유: 참조 카운트처럼 수치가 묶음(`{ releases, tours }`)으로 오는
 * 자리도 같은 규약을 써야 하는데, `number` 고정이면 그 자리만 규약 밖으로 새어 나간다.
 */
export function safeCount<T>(promise: Promise<T>): Promise<T | null> {
  return promise.catch((error) => {
    console.error("[admin] count failed:", error);
    return null;
  });
}
