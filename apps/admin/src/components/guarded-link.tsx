"use client";

import Link from "next/link";
import type { ComponentProps } from "react";

import { confirmLeaveUnsaved } from "@/lib/unsaved-guard";

/**
 * 미저장 변경 중 클릭을 가로채는 Link 래퍼. 대시보드 헤더 로고·카테고리 링크처럼
 * 서버 컴포넌트 레이아웃에 얇은 클라이언트 경계만 추가해 폼 dirty 가드를 건다.
 */
export function GuardedLink({
  onClick,
  ...props
}: ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        // 새 탭 열기(수식키 클릭)는 현재 페이지를 안 떠나므로 확인 불필요.
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (!confirmLeaveUnsaved()) {
          e.preventDefault();
          return;
        }
        onClick?.(e);
      }}
    />
  );
}
