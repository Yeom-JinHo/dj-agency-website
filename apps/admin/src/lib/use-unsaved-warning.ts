"use client";

import { useEffect } from "react";

import { setUnsavedGuard } from "@/lib/unsaved-guard";

/**
 * 미저장 변경이 있을 때 새로고침/창 닫기에 브라우저 확인을 띄운다.
 * App Router는 클라이언트 네비게이션 인터셉트를 공식 제공하지 않으므로
 * 폼 내부의 "취소" 버튼 확인 + 헤더 내비 가드(unsaved-guard)와 조합해
 * 실용적 커버리지를 확보한다(3개 폼 공용).
 */
export function useUnsavedWarning(enabled: boolean) {
  useEffect(() => {
    setUnsavedGuard(enabled);
    if (!enabled) return () => setUnsavedGuard(false);
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Safari는 아직 returnValue 설정에 의존한다 — preventDefault만으론 무시됨.
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => {
      window.removeEventListener("beforeunload", handler);
      setUnsavedGuard(false);
    };
  }, [enabled]);
}
