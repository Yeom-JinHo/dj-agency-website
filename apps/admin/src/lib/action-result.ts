/**
 * Artist/Release/Tour 액션의 공용 결과 형태. 세 엔티티가 같은 구조를 반환하므로
 * 소비 측(삭제 버튼·폼 제출 훅)이 엔티티별 분기 없이 하나의 타입으로 다룬다.
 * warning은 "본 작업은 성공했으나 후속 단계(발행·이미지)만 실패"를 뜻한다(§4.3).
 *
 * TField는 그 액션이 실패를 귀속시킬 수 있는 폼 필드 이름의 유니온이다. 액션이
 * 선언한 이름만 실을 수 있어 필드 리네임·오타가 타입 오류로 잡힌다. 기본값 never는
 * "귀속 불가"(폼이 없는 소비자 — 삭제 버튼 등)를 뜻해 field를 아예 못 싣게 한다.
 */
export type EntityActionResult<TField extends string = never> =
  | { ok: true; id?: string; warning?: string }
  | { ok: false; error: string; field?: TField };

/** catch로 받은 unknown을 사용자에게 보일 문자열로. */
export function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * 낙관적 동시성 충돌(update 액션 공용) — 폼이 로드한 updated_at과 현재 행이 다르면
 * 다른 탭·편집자가 먼저 저장한 것이다. last-write-wins로 조용히 덮어쓰는 대신
 * 이 문구로 끊는다. 새로고침이 유일한 복구 경로라 문구에 못 박는다.
 */
export const CONCURRENT_EDIT_MESSAGE =
  "저장하는 사이에 이 항목이 다른 곳에서 수정됐습니다. 페이지를 새로고침해 최신 내용을 확인한 뒤 변경사항을 다시 적용해주세요.";
