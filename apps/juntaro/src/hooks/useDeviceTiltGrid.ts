import type { RefObject } from "react";
import { useEffect, useState } from "react";

/**
 * 모바일 디바이스 틸트(자이로) 엔진 — 그리드 공유판.
 *
 * hero의 `useDeviceTilt`를 이식하되, 센서 1개 입력을 컨테이너 안의 모든 카드
 * 틸트 엘리먼트(`[data-tilt-card]`)에 **균일하게** 기록한다. 리스너 1개 + rAF
 * 루프 1개가 15개 카드를 처리한다(카드당 루프 금지). 카드엔 오프셋 자식이 없어
 * 패럴랙스(hero의 DEPTH_GAIN·[data-atropos-offset])는 없고 평면 rotate만 쓴다.
 *
 * ⚠️ 대상 카드 엘리먼트의 이미지 centering은 Tailwind v4에서 CSS `translate:`
 * longhand로 컴파일되어 `transform:` 프로퍼티와 독립 합성된다. 그래서 여기서
 * `element.style.transform`만 써도 중앙 정렬이 유지된다. 절대 `style.translate`를
 * 건드리거나 `-50%`를 transform에 baking 하지 말 것. 같은 노드에 Tailwind
 * transform 계열 유틸도 추가 금지(인라인 transform과 이중 적용).
 *
 * 카드 부모에 CSS perspective가 없으므로 transform 문자열에 `perspective(800px)`를
 * 반드시 포함한다(데스크톱 hover와 동일 800px).
 */

// ── 매핑 상수 (실기기 튜닝 지점) ────────────────────────────────
const ROTATE_MAX = 12; // 최대 회전각(deg). 그리드 동시 틸트라 hero(±20°)보다 절제 — 가장자리 틈·겹침 축소
const TILT_RANGE = 24; // 기기를 이 각도(deg)만큼 기울이면 도달
const PERSPECTIVE_PX = 800; // perspective 거리. 데스크톱 hover와 동일
const TAU = 0.09; // smoothing 시간상수(s). framerate 독립 lerp에 사용
const BETA_SIGN = -1; // 앞뒤(beta) 기울임 부호
const GAMMA_SIGN = 1; // 좌우(gamma) 기울임 부호
// ────────────────────────────────────────────────────────────────

export type TiltPermission = "idle" | "granted" | "denied" | "unsupported";

// iOS 13+ 전용 `requestPermission`은 표준 DeviceOrientationEvent 타입에 없음.
type DeviceOrientationEventStatic = {
  requestPermission?: () => Promise<"granted" | "denied">;
};

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

// hero와 grant 키를 공유 — 홈에서 이미 허용했으면 /music 즉시 동작. sessionStorage는
// 탭 세션과 함께 소멸 → iOS의 origin 권한 수명과 정렬됨.
const STORAGE_KEY = "jt-hero-tilt-granted";
const readGranted = () => {
  try {
    return sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false; // 사생활 모드 등 접근 불가 → 매번 탭으로 폴백
  }
};
const persistGranted = () => {
  try {
    sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // 접근 불가 → 무시(이번 마운트는 정상 동작, 다음 마운트에서 다시 탭)
  }
};

function useDeviceTiltGrid(
  rootRef: RefObject<HTMLElement | null>,
): TiltPermission {
  const [permission, setPermission] = useState<TiltPermission>("idle");

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    // 진입 게이트: pointer:coarse(데스크톱 fine과 상호배타) && !reduce-motion
    // && DeviceOrientationEvent 존재. 하나라도 불충족이면 정적(힌트 없음).
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const doeInWindow = "DeviceOrientationEvent" in window;
    if (!coarse || reduce || !doeInWindow) {
      setPermission("unsupported");
      return;
    }

    const cardEls = Array.from(
      el.querySelectorAll<HTMLElement>("[data-tilt-card]"),
    );
    if (cardEls.length === 0) {
      setPermission("unsupported");
      return;
    }

    let baseBeta: number | null = null;
    let baseGamma: number | null = null;
    let targetRx = 0;
    let targetRy = 0;
    let curRx = 0;
    let curRy = 0;
    let rafId = 0;
    let lastT = 0;
    let listening = false;
    let disposed = false;
    let requested = false;

    // 모든 카드에 동일한 평면 rotate를 기록. perspective를 문자열에 baking.
    const write = (rx: number, ry: number) => {
      const transform = `perspective(${PERSPECTIVE_PX}px) rotateX(${rx}deg) rotateY(${ry}deg)`;
      for (const card of cardEls) {
        card.style.transform = transform;
      }
    };

    // 단일 rAF 루프: 이벤트는 최신 목표각만 저장하고, DOM 쓰기는 여기서 담당.
    // alpha = 1 - exp(-dt/TAU) 로 framerate 독립 lerp (60/120Hz 동일 감).
    const tick = (t: number) => {
      rafId = requestAnimationFrame(tick);
      if (lastT === 0) {
        lastT = t;
        return;
      }
      const dt = (t - lastT) / 1000;
      lastT = t;
      const alpha = 1 - Math.exp(-dt / TAU);
      curRx += (targetRx - curRx) * alpha;
      curRy += (targetRy - curRy) * alpha;
      write(curRx, curRy);
    };

    const onOrientation = (e: DeviceOrientationEvent) => {
      const { beta, gamma } = e;
      // null 가드: iOS가 센서 미준비 시 null 방출 → NaN transform 방지.
      if (beta === null || gamma === null) return;
      // 첫 유효 판독값을 baseline(중립 0)으로 캡처, 이후 delta만 사용(절대각 금지).
      if (baseBeta === null || baseGamma === null) {
        baseBeta = beta;
        baseGamma = gamma;
        return;
      }
      const dBeta = beta - baseBeta;
      const dGamma = gamma - baseGamma;
      targetRx = clamp((BETA_SIGN * dBeta) / TILT_RANGE, -1, 1) * ROTATE_MAX;
      targetRy = clamp((GAMMA_SIGN * dGamma) / TILT_RANGE, -1, 1) * ROTATE_MAX;
    };

    // landscape 등 축전환 시 baseline 재캡처.
    const onOrientationChange = () => {
      baseBeta = null;
      baseGamma = null;
    };

    const startListening = () => {
      if (listening || disposed) return;
      listening = true;
      window.addEventListener("deviceorientation", onOrientation);
      window.addEventListener("orientationchange", onOrientationChange);
      rafId = requestAnimationFrame(tick);
    };

    // 첫 user gesture 핸들러: 권한 요청은 이 핸들러 '직접 statement'에서 동기 호출.
    // 컨테이너 레벨에 붙여 "아무 카드 첫 터치"로 권한 획득 → 카드별 중복 없음.
    // onClick→setState→useEffect 경유 금지(transient activation 소실 → NotAllowedError).
    const handleGesture = () => {
      if (requested) return;
      requested = true;
      el.removeEventListener("touchend", handleGesture);
      el.removeEventListener("click", handleGesture);

      const DOE = window.DeviceOrientationEvent as unknown as
        | DeviceOrientationEventStatic
        | undefined;
      if (typeof DOE?.requestPermission === "function") {
        // iOS 13+: gesture 핸들러 안에서 동기 호출해야 함.
        DOE.requestPermission()
          .then((res) => {
            if (disposed) return;
            if (res === "granted") {
              persistGranted();
              startListening();
              setPermission("granted");
            } else {
              // iOS는 세션 내 재프롬프트 안 뜸 → denied는 터미널(정적, 재시도 힌트 없음).
              setPermission("denied");
            }
          })
          .catch(() => {
            if (!disposed) setPermission("denied");
          });
      } else {
        // Android 등: 권한 개념 없음 → 바로 리스너 등록.
        persistGranted();
        startListening();
        setPermission("granted");
      }
    };

    // 이미 이 세션에서 허용했다면(홈에서 허용·재방문) 탭 없이 바로 시작.
    if (readGranted()) {
      startListening();
      setPermission("granted");
    } else {
      el.addEventListener("touchend", handleGesture, { passive: true });
      el.addEventListener("click", handleGesture);
    }

    return () => {
      disposed = true;
      el.removeEventListener("touchend", handleGesture);
      el.removeEventListener("click", handleGesture);
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("orientationchange", onOrientationChange);
      if (rafId) cancelAnimationFrame(rafId);
      for (const card of cardEls) {
        card.style.transform = "";
      }
    };
  }, [rootRef]);

  return permission;
}

export default useDeviceTiltGrid;
