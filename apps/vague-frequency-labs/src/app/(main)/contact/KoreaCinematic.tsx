"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

// window.naver 타입은 src/types/naver.d.ts에 분리됨

const SEOUL_COORDS = { lat: 37.5665, lng: 126.978 };

// Korea SVG 좌표계 (viewBox 0 0 400 500)
const SVG_VIEWBOX = { width: 400, height: 500 };
// Seoul ≈ { x: 73%, y: 35% } of viewBox
const SEOUL_SVG = { x: 292, y: 175 };

const SCRIPT_TIMEOUT_MS = 5000;
const FALLBACK_HREF =
  "https://map.naver.com/p/search/V.F.LABS%20%EC%84%9C%EC%9A%B8%20%EC%8B%9C%EC%B2%AD";

const NCP_KEY = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
const SCRIPT_SRC = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NCP_KEY ?? ""}`;

// 자체 작성 단순화 path (≤ 2KB, ≤ 50 commands). 미니멀 line art 톤.
// 한반도의 대략적 윤곽선을 따라 그린 장식적 path.
const KOREA_PATH =
  "M 200 50 L 215 65 L 230 80 L 250 70 L 270 85 L 290 110 L 305 135 L 315 160 L 320 185 L 318 215 L 310 240 L 300 265 L 290 290 L 285 315 L 280 345 L 270 375 L 255 405 L 240 435 L 220 455 L 200 470 L 180 460 L 165 440 L 155 415 L 150 385 L 152 355 L 158 325 L 162 300 L 158 275 L 148 250 L 138 225 L 128 200 L 122 175 L 125 150 L 135 125 L 150 100 L 170 80 L 185 65 Z";

type State = "idle" | "zooming" | "pulse" | "mapping" | "mapped" | "fallback";

export default function KoreaCinematic() {
  const [state, setState] = useState<State>("idle");
  const [scriptReady, setScriptReady] = useState(false);
  const reduce = useReducedMotion();
  const mapRef = useRef<unknown>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 빌드 타임 fallback: env 부재 시 click 1에서 즉시 fallback으로 분기 (handleClick1)
  // mapping 상태 진입 시 timeout 등록
  useEffect(() => {
    if (state !== "mapping") return;
    timeoutRef.current = setTimeout(() => {
      setState("fallback");
    }, SCRIPT_TIMEOUT_MS);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [state]);

  const initMap = useCallback((lat: number, lng: number) => {
    if (typeof window === "undefined" || !window.naver?.maps) return;
    const el = document.getElementById("vfl-map");
    if (!el) return;
    try {
      const map = new window.naver.maps.Map("vfl-map", {
        center: new window.naver.maps.LatLng(lat, lng),
        zoom: 16,
        mapTypeControl: true,
        zoomControl: true,
      });
      mapRef.current = map;
      new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(lat, lng),
        map,
        icon: {
          path: [
            new window.naver.maps.Point(0, 70),
            new window.naver.maps.Point(20, 100),
            new window.naver.maps.Point(40, 70),
            new window.naver.maps.Point(30, 70),
            new window.naver.maps.Point(70, 0),
            new window.naver.maps.Point(10, 70),
          ],
          style: "closedPath",
          anchor: new window.naver.maps.Point(23, 103),
          fillColor: "#ffffff",
          fillOpacity: 1,
          strokeColor: "#000000",
          strokeStyle: "solid",
          strokeWeight: 3,
        },
      });
    } catch {
      setState("fallback");
    }
  }, []);

  // scriptReady가 되면 mapping 상태에서 initMap 호출 후 mapped로 전이
  useEffect(() => {
    if (state !== "mapping" || !scriptReady) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    initMap(SEOUL_COORDS.lat, SEOUL_COORDS.lng);
    setState("mapped");
  }, [state, scriptReady, initMap]);

  // unmount cleanup — Naver Maps v3는 destroy() 없음 → ref null + container clear
  useEffect(() => {
    const container = containerRef.current;
    return () => {
      mapRef.current = null;
      if (container) container.innerHTML = "";
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const handleClick1 = useCallback(() => {
    if (state !== "idle") return;
    if (!NCP_KEY) {
      setState("fallback");
      return;
    }
    setState(reduce ? "pulse" : "zooming");
  }, [state, reduce]);

  const handleZoomDone = useCallback(() => {
    setState((prev) => (prev === "zooming" ? "pulse" : prev));
  }, []);

  const handleClick2 = useCallback(() => {
    if (state !== "pulse") return;
    setState("mapping");
  }, [state]);

  const onIdleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick1();
    }
  };

  const onPulseKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick2();
    }
  };

  // 반응형 zoom scale: viewport 기반 (Tailwind 기준 md=768px). 320px ≤ 3.5, 768px+ ≤ 5.
  const getZoomScale = () => {
    if (typeof window === "undefined") return 5;
    return window.innerWidth >= 768 ? 5 : 3.5;
  };

  const fadeDuration = reduce ? 0.05 : 0.3;
  const showSvgLayer =
    state === "idle" || state === "zooming" || state === "pulse";
  const mapMounted = state === "mapping" || state === "mapped";

  return (
    <div
      ref={containerRef}
      className="relative h-[400px] w-full overflow-hidden"
      aria-live="polite"
    >
      {state !== "idle" && state !== "fallback" && NCP_KEY && (
        <Script
          src={SCRIPT_SRC}
          strategy="afterInteractive"
          onReady={() => setScriptReady(true)}
          onLoad={() => setScriptReady(true)}
          onError={() => setState("fallback")}
        />
      )}

      <AnimatePresence>
        {showSvgLayer && (
          <motion.div
            key="svg-layer"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeDuration }}
          >
            <motion.svg
              viewBox={`0 0 ${SVG_VIEWBOX.width} ${SVG_VIEWBOX.height}`}
              role="button"
              aria-label="한반도 지도 열기"
              tabIndex={state === "idle" ? 0 : -1}
              onClick={state === "idle" ? handleClick1 : undefined}
              onKeyDown={state === "idle" ? onIdleKey : undefined}
              className={`h-full w-full text-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current dark:text-neutral-200 ${
                state === "idle" ? "cursor-pointer" : ""
              }`}
              style={{
                transformOrigin: `${SEOUL_SVG.x}px ${SEOUL_SVG.y}px`,
                willChange: "transform",
              }}
              initial={{ scale: 1 }}
              animate={{
                scale:
                  state === "zooming"
                    ? getZoomScale()
                    : state === "pulse"
                      ? getZoomScale()
                      : 1,
              }}
              transition={{
                duration: state === "zooming" ? 0.8 : 0,
                ease: "easeInOut",
              }}
              onAnimationComplete={
                state === "zooming" ? handleZoomDone : undefined
              }
            >
              <path
                d={KOREA_PATH}
                stroke="currentColor"
                strokeWidth={2}
                fill="none"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {state === "idle" && (
                <text
                  x={SEOUL_SVG.x + 12}
                  y={SEOUL_SVG.y + 4}
                  fontSize={14}
                  fill="currentColor"
                  className="pointer-events-none select-none opacity-60"
                >
                  서울 ▸ 지도 보기
                </text>
              )}
              {(state === "pulse" || state === "zooming") && (
                <>
                  <motion.circle
                    cx={SEOUL_SVG.x}
                    cy={SEOUL_SVG.y}
                    r={4}
                    fill="currentColor"
                    initial={{ scale: 1, opacity: 0.9 }}
                    animate={
                      state === "pulse"
                        ? reduce
                          ? { opacity: [0.6, 1, 0.6] }
                          : { scale: [1, 1.6, 1], opacity: [0.9, 0.4, 0.9] }
                        : { scale: 1, opacity: 0.9 }
                    }
                    transition={{
                      repeat: state === "pulse" ? Infinity : 0,
                      duration: 1.6,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.circle
                    cx={SEOUL_SVG.x}
                    cy={SEOUL_SVG.y}
                    r={10}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1}
                    initial={{ scale: 1, opacity: 0.6 }}
                    animate={
                      state === "pulse" && !reduce
                        ? { scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }
                        : { scale: 1, opacity: 0 }
                    }
                    transition={{
                      repeat: state === "pulse" ? Infinity : 0,
                      duration: 1.6,
                      ease: "easeOut",
                    }}
                  />
                </>
              )}
            </motion.svg>

            {state === "pulse" && (
              <button
                type="button"
                onClick={handleClick2}
                onKeyDown={onPulseKey}
                aria-label="서울 인터랙티브 지도 열기"
                className="absolute rounded-full px-3 py-1 text-xs font-medium text-neutral-800 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current dark:text-neutral-100"
                style={{
                  left: `${(SEOUL_SVG.x / SVG_VIEWBOX.width) * 100}%`,
                  top: `calc(${(SEOUL_SVG.y / SVG_VIEWBOX.height) * 100}% + 24px)`,
                  transform: "translate(-50%, 0)",
                }}
              >
                서울 ▸ 지도 열기
              </button>
            )}
          </motion.div>
        )}

        {state === "mapping" && !scriptReady && (
          <motion.div
            key="loading"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeDuration }}
          >
            {reduce ? (
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                지도를 불러오는 중…
              </p>
            ) : (
              <motion.div
                className="h-3 w-24 rounded-full bg-neutral-300 dark:bg-neutral-700"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ repeat: Infinity, duration: 1.2 }}
                aria-hidden="true"
              />
            )}
          </motion.div>
        )}

        {mapMounted && scriptReady && (
          <motion.div
            key="map-layer"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: fadeDuration }}
          >
            <div id="vfl-map" className="h-full w-full" />
          </motion.div>
        )}

        {state === "fallback" && (
          <motion.div
            key="fallback"
            className="absolute inset-0 flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: fadeDuration }}
          >
            <div className="flex max-w-sm flex-col items-center gap-4 rounded-lg border border-neutral-200 bg-white/60 p-6 text-center backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/60">
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                지도를 불러올 수 없습니다
              </p>
              <a
                href={FALLBACK_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
              >
                Naver Maps에서 보기
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
