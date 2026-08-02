/**
 * Artist/Release/Tour 액션의 공용 결과 형태. 세 엔티티가 같은 구조를 반환하므로
 * 소비 측(삭제 버튼·폼 제출 훅)이 엔티티별 분기 없이 하나의 타입으로 다룬다.
 * warning은 "본 작업은 성공했으나 후속 단계(발행·이미지)만 실패"를 뜻한다(§4.3).
 */
export type EntityActionResult =
  | { ok: true; id?: string; warning?: string }
  | { ok: false; error: string };

/** catch로 받은 unknown을 사용자에게 보일 문자열로. */
export function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}
