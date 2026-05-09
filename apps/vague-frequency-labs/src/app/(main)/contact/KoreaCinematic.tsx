"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

// window.naver 타입은 src/types/naver.d.ts에 분리됨

const SEOUL_COORDS = { lat: 37.5665, lng: 126.978 };

// public/korea-peninsula.svg (Wikimedia Commons, Public Domain by Ksiom)
const KOREA_SVG_SRC = "/korea-peninsula.svg";
const KOREA_ASPECT = 761 / 1243; // SVG width / height
// Seoul 위치 (SVG viewBox 비율). 위도 37.566 / 경도 126.978의 한반도 외곽 추정값.
// 첫 cinematic frame에서 어색하면 0.5pt 단위로 미세 조정.
const SEOUL_PCT = { x: 42.6, y: 54.3 };

const SCRIPT_TIMEOUT_MS = 5000;
const FALLBACK_HREF =
  "https://map.naver.com/p/search/V.F.LABS%20%EC%84%9C%EC%9A%B8%20%EC%8B%9C%EC%B2%AD";

const NCP_KEY = process.env.NEXT_PUBLIC_NAVER_CLIENT_ID;
const SCRIPT_SRC = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NCP_KEY ?? ""}`;

type State = "idle" | "zooming" | "pulse" | "mapping" | "mapped" | "fallback";

export default function KoreaCinematic() {
  const [state, setState] = useState<State>("idle");
  const [scriptReady, setScriptReady] = useState(false);
  const reduce = useReducedMotion();
  const mapRef = useRef<unknown>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // unmount cleanup — Naver Maps v3는 destroy() 없음 → ref null + map container clear
  useEffect(() => {
    return () => {
      mapRef.current = null;
      const mapEl = document.getElementById("vfl-map");
      if (mapEl) mapEl.replaceChildren();
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

  const onIdleKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick1();
      }
    },
    [handleClick1],
  );

  const onPulseKey = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick2();
      }
    },
    [handleClick2],
  );

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
            {/* 한반도 SVG wrapper — aspect-ratio가 SVG와 1:1이라 Seoul %좌표가 정확히 일치 */}
            <motion.div
              role={state === "idle" ? "button" : undefined}
              aria-label={state === "idle" ? "한반도 지도 열기" : undefined}
              tabIndex={state === "idle" ? 0 : -1}
              onClick={state === "idle" ? handleClick1 : undefined}
              onKeyDown={state === "idle" ? onIdleKey : undefined}
              className={`group relative h-full ${
                state === "idle"
                  ? "cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
                  : ""
              }`}
              style={{
                aspectRatio: `${KOREA_ASPECT}`,
                transformOrigin: `${SEOUL_PCT.x}% ${SEOUL_PCT.y}%`,
                willChange: "transform",
              }}
              initial={{ scale: 1 }}
              animate={{
                scale: state === "idle" ? 1 : getZoomScale(),
              }}
              transition={{
                duration: state === "zooming" ? 0.8 : 0,
                ease: "easeInOut",
              }}
              onAnimationComplete={
                state === "zooming" ? handleZoomDone : undefined
              }
            >
              {/* Wikimedia Commons / Public Domain (Ksiom, 2008). public/korea-peninsula.svg */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={KOREA_SVG_SRC}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="pointer-events-none h-full w-full select-none opacity-80 transition-opacity duration-300 group-hover:opacity-100 dark:opacity-70 dark:group-hover:opacity-95"
              />

              {/* Seoul pulse — wrapper와 SVG가 1:1 비율이므로 % 좌표가 SVG 픽셀 좌표와 정확히 일치 */}
              {(state === "pulse" || state === "zooming") && (
                <div
                  className="pointer-events-none absolute"
                  style={{
                    left: `${SEOUL_PCT.x}%`,
                    top: `${SEOUL_PCT.y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <motion.div
                    className="relative h-2 w-2 rounded-full bg-neutral-900 dark:bg-neutral-100"
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
                  {state === "pulse" && !reduce && (
                    <motion.div
                      className="absolute inset-0 rounded-full border border-neutral-900 dark:border-neutral-100"
                      initial={{ scale: 1, opacity: 0.6 }}
                      animate={{ scale: [1, 3, 1], opacity: [0.6, 0, 0.6] }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.6,
                        ease: "easeOut",
                      }}
                    />
                  )}
                </div>
              )}

              {/* idle 상태: Seoul attention dot + 명확한 CTA chip */}
              {state === "idle" && (
                <>
                  <div
                    className="pointer-events-none absolute"
                    style={{
                      left: `${SEOUL_PCT.x}%`,
                      top: `${SEOUL_PCT.y}%`,
                      transform: "translate(-50%, -50%)",
                    }}
                  >
                    <motion.div
                      className="h-2.5 w-2.5 rounded-full bg-neutral-900 shadow-[0_0_0_2px_rgba(255,255,255,0.85)] dark:bg-neutral-100 dark:shadow-[0_0_0_2px_rgba(0,0,0,0.6)]"
                      animate={
                        reduce
                          ? { opacity: 1 }
                          : { scale: [1, 1.25, 1], opacity: [1, 0.7, 1] }
                      }
                      transition={{
                        repeat: reduce ? 0 : Infinity,
                        duration: 1.8,
                        ease: "easeInOut",
                      }}
                    />
                    {!reduce && (
                      <motion.div
                        className="absolute inset-0 rounded-full border border-neutral-900 dark:border-neutral-100"
                        animate={{
                          scale: [1, 2.6, 1],
                          opacity: [0.55, 0, 0.55],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.8,
                          ease: "easeOut",
                        }}
                      />
                    )}
                  </div>

                  <motion.div
                    className="pointer-events-none absolute flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white/95 px-3 py-1.5 text-sm font-medium whitespace-nowrap text-neutral-900 shadow-md backdrop-blur dark:border-neutral-700 dark:bg-neutral-900/95 dark:text-neutral-100"
                    style={{
                      left: `${SEOUL_PCT.x}%`,
                      top: `calc(${SEOUL_PCT.y}% + 22px)`,
                      transform: "translate(-50%, 0)",
                    }}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                  >
                    <span aria-hidden="true">📍</span>
                    Seoul · 클릭해서 지도 열기
                  </motion.div>
                </>
              )}
            </motion.div>

            {/* pulse 상태 click 2 button — wrapper 바깥 화면 좌표에 두지 않고 컨테이너 하단 중앙 */}
            {state === "pulse" && (
              <button
                type="button"
                onClick={handleClick2}
                onKeyDown={onPulseKey}
                aria-label="서울 인터랙티브 지도 열기"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full border border-neutral-300 bg-white/80 px-4 py-1.5 text-sm font-medium text-neutral-800 backdrop-blur transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-100 dark:hover:bg-neutral-900"
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
