"use client";

/**
 * 헤더 내비(로고·사이트 스위처·카테고리 링크)가 폼 dirty 여부를 클릭 시점에만
 * 읽을 수 있게 하는 모듈 스코프 플래그. Context/Provider나 구독 없이 confirm까지
 * 한 헬퍼로 노출한다 — 헤더는 리렌더될 필요 없이 네비게이션 직전에 한 번만
 * 확인하면 된다. use-unsaved-warning 훅이 폼 dirty 상태와 함께 갱신한다(3개 폼 공용).
 */
let unsaved = false;

export function setUnsavedGuard(value: boolean) {
  unsaved = value;
}

/** "나갈까요?" 확인 문구. 헤더 내비의 confirmLeaveUnsaved()와 폼 취소 버튼
 * (use-entity-form-submit)이 공유한다 — 판단 조건(모듈 스코프 플래그 vs.
 * 로컬 hasUnsaved)은 서로 달라 헬퍼 자체는 합치지 않지만, 같은 상황에서
 * 다른 말이 나오지 않도록 문구만 한 곳에서 관리한다. */
export const UNSAVED_LEAVE_CONFIRM_MESSAGE =
  "저장하지 않은 변경사항이 있습니다. 나갈까요?";

/** 미저장 변경이 있을 때만 confirm을 띄운다. 헤더 내비(GuardedLink·SiteSwitcher)가 공유한다. */
export function confirmLeaveUnsaved(): boolean {
  if (!unsaved) return true;
  return window.confirm(UNSAVED_LEAVE_CONFIRM_MESSAGE);
}
