"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";

/**
 * SSR-safe prefers-reduced-motion.
 *
 * motion의 useReducedMotion은 클라 첫 렌더에서 즉시 실제 값을 반환하므로,
 * reduce 사용자의 경우 서버(false 기준) 마크업과 첫 클라 렌더가 어긋나
 * hydration mismatch가 난다. 마운트 전에는 서버와 동일하게 false를 돌려주고
 * 마운트 후에만 실제 선호값으로 전환해 이를 막는다.
 */
export function useReducedMotionSafe(): boolean {
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted && !!prefersReduced;
}
