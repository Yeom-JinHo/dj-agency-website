"use client";

import type { ReactNode } from "react";
import { useRef } from "react";

import useDeviceTiltGrid from "@/hooks/useDeviceTiltGrid";

interface DeviceTiltScopeProps {
  children: ReactNode;
  className?: string;
}

/**
 * /music 페이지(서버 컴포넌트)의 모바일 콜라주 카드 컨테이너를 감싸 컨테이너 ref +
 * 그리드 자이로 엔진을 호스팅하는 클라이언트 스코프. 컨테이너 레벨에 첫 터치 제스처
 * 리스너가 붙어, 아무 카드 첫 터치로 iOS 권한을 획득한다(엔진 내부 처리).
 *
 * 데스크톱 콜라주는 hover 틸트를 유지하며 coarse 게이트로 이 엔진이 자동 비활성이라
 * 감쌀 필요가 없다 — 최소 변경 원칙상 모바일 블록에만 두른다.
 */
export function DeviceTiltScope({ children, className }: DeviceTiltScopeProps) {
  const ref = useRef<HTMLDivElement>(null);
  useDeviceTiltGrid(ref);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
