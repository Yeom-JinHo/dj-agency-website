/**
 * 카운트 조회 실패를 null로 흡수한다(대시보드·사이트 홈 공용).
 * 수치 하나 때문에 페이지 전체를 죽이지 않되, 무음으로 삼키면 RLS·네트워크 문제가
 * "그냥 숫자가 안 보임"으로 위장되므로 서버 로그에는 반드시 남긴다.
 */
export function safeCount(promise: Promise<number>): Promise<number | null> {
  return promise.catch((error) => {
    console.error("[admin] count failed:", error);
    return null;
  });
}
