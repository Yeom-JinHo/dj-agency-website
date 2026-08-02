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

/** 미저장 변경이 있을 때만 confirm을 띄운다. 문구를 한 곳에 모아 헤더 내비
 * (GuardedLink·SiteSwitcher)가 공유한다 — 폼 취소 버튼은 로컬 hasUnsaved
 * 조건을 쓰므로 이 헬퍼와 별개로 둔다. */
export function confirmLeaveUnsaved(): boolean {
  if (!unsaved) return true;
  return window.confirm("저장하지 않은 변경사항이 있습니다. 나갈까요?");
}
