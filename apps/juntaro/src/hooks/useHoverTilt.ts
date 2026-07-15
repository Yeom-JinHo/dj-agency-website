import type { MouseEvent as ReactMouseEvent } from "react";
import { useCallback, useEffect, useRef } from "react";

/**
 * 데스크톱 hover 미세 틸트 엔진.
 *
 * hover 중 마우스 위치를 따라 대상 엘리먼트가 ±ROTATE_MAX_DEG 기울도록
 * `style.transform`에 perspective+rotateX/Y를 직접 기록한다. React state를
 * 쓰지 않아 mousemove 중 리렌더가 없고, DOM 쓰기는 rAF로 스로틀된다.
 *
 * ⚠️ 대상 엘리먼트는 자체 transform이 없어야 한다(인라인 transform이 유일한
 * transform이라는 전제). Tailwind transform 계열 유틸을 같은 노드에 추가하면
 * 이중 적용된다 — useDeviceTilt의 translate 합성 교훈과 동일 지뢰.
 */

// ── 튜닝 상수 ────────────────────────────────────────────────────
const ROTATE_MAX_DEG = 8; // 최대 기울기(deg). 5는 데모에서 체감 부족 — hero(±9°) 직전까지
const PERSPECTIVE_PX = 800; // perspective 거리. 작을수록 원근 과장
const RETURN_MS = 300; // 이탈 복귀. 기존 hover 어휘의 duration-300과 동일 박자
const FOLLOW_MS = 150; // hover 중 마우스 추적 스무딩
// ────────────────────────────────────────────────────────────────

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

function useHoverTilt<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  // null = 미평가. 첫 mouseenter에서 1회만 평가해 메모한다(SSR 안전 — render
  // body에서 matchMedia 금지). 세션 중 reduced-motion 토글은 미반영(리로드로 충분).
  const enabledRef = useRef<boolean | null>(null);
  // mouseenter에서 1회 캐시 — transform은 레이아웃에 영향이 없어 hover 중 rect가
  // 불변이므로 매 프레임 layout read를 제거한다. 조상 scale 전환(1→1.05) 중의
  // ~5% 드리프트는 nx/ny clamp가 흡수한다.
  const rectRef = useRef<DOMRect | null>(null);
  const rafRef = useRef(0);

  // mouseleave 겸용 + 단독 노출: 클릭(모달 열림) 시 mouseleave가 발화하지 않아
  // 마지막 각도로 얼어붙는 것을 소비자가 onClick에서 직접 풀 수 있게 한다.
  const reset = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const el = ref.current;
    if (!el) return;
    el.style.transition = `transform ${RETURN_MS}ms ease-out`;
    el.style.transform = "";
  }, []);

  const onMouseEnter = useCallback(() => {
    if (enabledRef.current === null) {
      enabledRef.current =
        window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
        !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }
    if (!enabledRef.current) return;
    const el = ref.current;
    if (!el) return;
    rectRef.current = el.getBoundingClientRect();
    // 추적 transition은 진입 시 1회만 설정 — rAF 콜백에서 매 프레임 재기록하지 않는다.
    el.style.transition = `transform ${FOLLOW_MS}ms ease-out`;
  }, []);

  const onMouseMove = useCallback((e: ReactMouseEvent<T>) => {
    if (!enabledRef.current) return;
    const { clientX, clientY } = e;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const el = ref.current;
      const rect = rectRef.current;
      if (!el || !rect) return;
      const nx = clamp(((clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      const ny = clamp(((clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
      el.style.transform = `perspective(${PERSPECTIVE_PX}px) rotateX(${-ny * ROTATE_MAX_DEG}deg) rotateY(${nx * ROTATE_MAX_DEG}deg)`;
    });
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return { ref, onMouseEnter, onMouseMove, onMouseLeave: reset, reset };
}

export default useHoverTilt;
