import type { RefObject } from "react";
import { useEffect, useState } from "react";

/**
 * 모바일 디바이스 틸트(자이로) 엔진.
 *
 * 데스크톱 atropos(마우스)와 상호배타로, 동일한 `.atropos-rotate` /
 * `[data-atropos-offset]` DOM에 atropos 2.0.2와 같은 transform 공식을 직접
 * 기록한다. atropos 인스턴스는 생성하지 않는다.
 *
 * ⚠️ 이미지 centering(`-translate-x-1/2 -translate-y-1/2`)은 Tailwind v4에서
 * CSS `translate:` longhand로 컴파일되어 `transform:` 프로퍼티와 **독립적으로**
 * 합성된다. 그래서 여기서 `element.style.transform`만 써도 중앙 정렬이 유지된다.
 * 절대 `style.translate`를 건드리거나 `-50%`를 transform에 baking 하지 말 것 —
 * 이 합성이 데스크톱 atropos가 동작하는 이유이자 모바일이 동작하는 이유다.
 */

// ── 매핑 상수 (실기기 튜닝 지점) ────────────────────────────────
const ROTATE_MAX = 18; // 최대 회전각(deg). 데스크톱 9°의 2배 — 강한 틸트(중앙 정렬이라 가장자리 노출 없음)
const TILT_RANGE = 26; // 기기를 이 각도(deg)만큼 기울이면 ROTATE_MAX 도달. 작을수록 예민·강하게 반응
const DEPTH_GAIN = 1.6; // 자식 레이어 패럴랙스 증폭(모바일 전용). 입체감의 핵심 레버. 회전각과 독립
const TAU = 0.09; // smoothing 시간상수(s). 클수록 느긋. framerate 독립 lerp에 사용
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

// 허용 사실을 sessionStorage에 기록해, 재방문·클라이언트 라우팅 복귀 시 탭 없이
// 바로 틸트를 켠다. sessionStorage는 탭 세션과 함께 소멸 → iOS의 origin 권한 수명과
// 정렬됨. localStorage(영구)면 다음 세션엔 실제 권한이 없는데 플래그만 남아 무탭
// 시도가 조용히 실패하고 pill도 안 떠 재활성화가 불가하다.
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

function useDeviceTilt(rootRef: RefObject<HTMLElement | null>): TiltPermission {
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

    const rotateEl = el.querySelector<HTMLElement>(".atropos-rotate");
    const offsetEls = Array.from(
      el.querySelectorAll<HTMLElement>("[data-atropos-offset]"),
    );

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

    const write = (rx: number, ry: number) => {
      if (rotateEl) {
        rotateEl.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      }
      const rxPct = (rx / ROTATE_MAX) * 100;
      const ryPct = (ry / ROTATE_MAX) * 100;
      for (const child of offsetEls) {
        const offset = Number(child.dataset.atroposOffset) || 0;
        child.style.transform = `translate3d(${
          (ryPct * offset * DEPTH_GAIN) / 100
        }%, ${(-rxPct * offset * DEPTH_GAIN) / 100}%, 0)`;
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

    // 이미 이 세션에서 허용했다면(재방문·클라이언트 라우팅 복귀) 탭 없이 바로 시작.
    // 허용된 origin은 gesture 없이도 deviceorientation이 발화한다.
    if (readGranted()) {
      startListening();
      setPermission("granted");
    } else {
      el.addEventListener("touchend", handleGesture, { passive: true });
      el.addEventListener("click", handleGesture);
      // 진입 조건 충족 & 미허용 상태 → state "idle" 유지(폴백 힌트 노출).
    }

    return () => {
      disposed = true;
      el.removeEventListener("touchend", handleGesture);
      el.removeEventListener("click", handleGesture);
      window.removeEventListener("deviceorientation", onOrientation);
      window.removeEventListener("orientationchange", onOrientationChange);
      if (rafId) cancelAnimationFrame(rafId);
      if (rotateEl) rotateEl.style.transform = "";
      for (const child of offsetEls) {
        child.style.transform = "";
      }
    };
  }, [rootRef]);

  return permission;
}

export default useDeviceTilt;
