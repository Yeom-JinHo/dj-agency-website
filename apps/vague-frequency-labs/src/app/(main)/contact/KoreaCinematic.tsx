"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { IconMapPin } from "@tabler/icons-react";

// window.naver 타입은 src/types/naver.d.ts에 분리됨

const SEOUL_COORDS = { lat: 37.5665, lng: 126.978 };

// public/korea-peninsula.svg (Wikimedia Commons, Public Domain by Ksiom) — peninsula outline image
const KOREA_SVG_SRC = "/korea-peninsula.svg";
// public/south-korea-flag.svg (Wikimedia Commons, Public Domain) — flag pin image at Seoul
const KOREA_FLAG_SRC = "/south-korea-flag.svg";
const KOREA_ASPECT = 761 / 1243; // SVG width / height
// Seoul 위치 (SVG viewBox 비율). 위도 37.566 / 경도 126.978을 한반도 위경도 범위
// (lat 43↔34, lng 124↔131)에 대해 단순 비례로 추정한 값. SVG 투영이 mercator라
// 약간 어긋날 수 있어 실제 렌더에서 0.5pt 단위 미세 조정 가능.
const SEOUL_PCT = { x: 42.6, y: 61 };

const SCRIPT_TIMEOUT_MS = 5000;
// pulse 단계가 cinematic의 일부로 자동 진행되는 시간 (사용자 click 부담 제거)
const PULSE_AUTO_MS = 1400;
const PULSE_AUTO_REDUCE_MS = 500;
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
  const mapElRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // pulse 진입 후 자동으로 mapping으로 진행 (사용자 click 부담 제거).
  // 사용자가 SVG/컨테이너를 클릭하면 즉시 mapping으로 skip 가능.
  useEffect(() => {
    if (state !== "pulse") return;
    const id = setTimeout(
      () => {
        setState((prev) => (prev === "pulse" ? "mapping" : prev));
      },
      reduce ? PULSE_AUTO_REDUCE_MS : PULSE_AUTO_MS,
    );
    return () => clearTimeout(id);
  }, [state, reduce]);

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
    const el = mapElRef.current;
    if (!el) return;
    try {
      const map = new window.naver.maps.Map(el, {
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

  // unmount cleanup — Naver Maps v3는 destroy() 없음 → ref null + map container clear.
  // mapElRef.current를 effect 진입 시점에 capture해 unmount 시 안전하게 사용.
  useEffect(() => {
    const mapEl = mapElRef.current;
    return () => {
      mapRef.current = null;
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

  // 반응형 zoom scale (320px: 3.5, 768px+: 5). SSR/hydration mismatch 방지를 위해
  // 초기값은 데스크톱 default(5)로 둔 뒤 mount 후 useEffect로 갱신. resize 대응까지 포함.
  const [zoomScale, setZoomScale] = useState(5);
  useEffect(() => {
    const update = () =>
      setZoomScale(window.innerWidth >= 768 ? 5 : 3.5);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const fadeDuration = reduce ? 0.05 : 0.3;
  const showSvgLayer =
    state === "idle" || state === "zooming" || state === "pulse";
  const mapMounted = state === "mapping" || state === "mapped";
  const wrapperClickable = state === "idle" || state === "pulse";

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
            {/* 한반도 SVG wrapper — aspect-ratio가 SVG와 1:1이라 Seoul %좌표가 정확히 일치.
                idle: click 1로 cinematic 시작. pulse: click하면 자동 진행을 skip하고 즉시 mapping. */}
            <motion.div
              role={wrapperClickable ? "button" : undefined}
              aria-label={
                state === "idle"
                  ? "Open the Seoul map"
                  : state === "pulse"
                    ? "Skip to the map"
                    : undefined
              }
              tabIndex={wrapperClickable ? 0 : -1}
              onClick={
                state === "idle"
                  ? handleClick1
                  : state === "pulse"
                    ? handleClick2
                    : undefined
              }
              onKeyDown={
                state === "idle"
                  ? onIdleKey
                  : state === "pulse"
                    ? onPulseKey
                    : undefined
              }
              className={`group relative h-full ${
                wrapperClickable
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
                scale: state === "idle" ? 1 : zoomScale,
              }}
              transition={{
                duration: state === "zooming" ? 0.8 : 0,
                ease: "easeInOut",
              }}
              onAnimationComplete={
                state === "zooming" ? handleZoomDone : undefined
              }
            >
              {/* 한반도 stencil — 1178 path의 섬/해안 디테일을 잃지 않도록 <img>로 그대로.
                  Wikimedia Commons / Public Domain (Ksiom, 2008). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={KOREA_SVG_SRC}
                alt=""
                aria-hidden="true"
                draggable={false}
                className="pointer-events-none h-full w-full select-none opacity-80 transition-opacity duration-300 group-hover:opacity-100"
              />


              {/* Seoul pulse — pulse 상태 전용 (zooming 동안에는 flag pin이 attention 역할).
                  pulse 진입 직후 dot 오른쪽에 'Seoul' 라벨이 fade-in 되어 도시명을 명시. */}
              {state === "pulse" && (
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
                      reduce
                        ? { opacity: [0.6, 1, 0.6] }
                        : { scale: [1, 1.6, 1], opacity: [0.9, 0.4, 0.9] }
                    }
                    transition={{
                      repeat: Infinity,
                      duration: 1.6,
                      ease: "easeInOut",
                    }}
                  />
                  {!reduce && (
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
                  {/* "Seoul" 라벨 — dot의 오른쪽에 inline 표시. wrapper가 zoom 상태이므로
                      base text size를 작게(text-[4px]) 두면 화면 표시 시점에는 ~14~20px로 보임. */}
                  <motion.span
                    className="absolute top-1/2 left-full ml-1 -translate-y-1/2 text-[4px] font-semibold tracking-tight whitespace-nowrap text-neutral-900 dark:text-neutral-100"
                    initial={{ opacity: 0, x: -2 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: reduce ? 0.05 : 0.4,
                      delay: reduce ? 0 : 0.15,
                      ease: "easeOut",
                    }}
                  >
                    Seoul
                  </motion.span>
                </div>
              )}

              {/* Seoul flag pin — idle + zooming 동안 표시. zooming 단계에선 wrapper와 함께
                  5x로 확대되며 자연스럽게 화면 밖으로 sweep out (pop 없음). */}
              {(state === "idle" || state === "zooming") && (
                <div
                  className="pointer-events-none absolute flex flex-col items-center"
                  style={{
                    left: `${SEOUL_PCT.x}%`,
                    top: `${SEOUL_PCT.y}%`,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  {/* 한국 국기 — pin의 깃발 (정적). */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={KOREA_FLAG_SRC}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    className="block h-7 w-10 select-none rounded-[3px] shadow-md ring-1 ring-black/20 dark:ring-white/15"
                  />
                  {/* pin stick — flag와 anchor dot 사이의 깃대. */}
                  <span className="block h-5 w-px bg-neutral-900 dark:bg-neutral-100" />
                  {/* anchor dot + expanding ring (attention pulse). */}
                  <span className="relative block h-1.5 w-1.5">
                    <span className="absolute inset-0 rounded-full bg-neutral-900 dark:bg-neutral-100" />
                    {!reduce && state === "idle" && (
                      <motion.span
                        className="absolute inset-0 block rounded-full border border-neutral-900 dark:border-neutral-100"
                        animate={{
                          scale: [1, 3.5, 1],
                          opacity: [0.55, 0, 0.55],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 1.8,
                          ease: "easeOut",
                        }}
                      />
                    )}
                  </span>
                </div>
              )}

              {/* CTA chip — idle에서만 (zoom 시작과 함께 사라짐). */}
              {state === "idle" && (
                <motion.div
                    className="pointer-events-none absolute flex items-center gap-2 rounded-full bg-neutral-900/55 px-4 py-2 text-sm font-semibold tracking-tight whitespace-nowrap text-white shadow-lg shadow-black/30 ring-1 ring-white/15 backdrop-blur-md"
                    style={{
                      left: `${SEOUL_PCT.x}%`,
                      top: `calc(${SEOUL_PCT.y}% + 28px)`,
                      transform: "translate(-50%, 0)",
                    }}
                    initial={{ opacity: 0, scale: 0.85, y: -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: reduce ? 0.05 : 0.5,
                      delay: reduce ? 0 : 0.3,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    <IconMapPin
                      size={15}
                      stroke={1.8}
                      aria-hidden="true"
                      className="-mt-0.5 shrink-0"
                    />
                    Find us in Seoul
                    <span
                      aria-hidden="true"
                      className="ml-0.5 text-base leading-none opacity-70"
                    >
                    ↗
                  </span>
                </motion.div>
              )}
            </motion.div>

            {/* pulse 상태에서는 별도 button 없이 SVG wrapper 자체가 skip 액션 영역.
                cinematic은 PULSE_AUTO_MS 후 자동으로 mapping으로 진행됨. */}
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
            className="absolute inset-0 origin-center"
            initial={{ opacity: 0, scale: reduce ? 1 : 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: reduce ? 0.05 : 0.7,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div ref={mapElRef} id="vfl-map" className="h-full w-full" />
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
