"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import DottedMap from "dotted-map";

import { LOADER_TIMELINE, useLoaderMarkDone } from "./loader-context";

// 오프닝 씬: 단일 fullscreen canvas에서 font-display "VFL" 글리프를 픽셀 샘플링해
// dot들로 형성하고(0.8s) → 유지(0.7s) → dotted-map의 실제 지도 dot 좌표로 1:1
// 트윈 착지(1.0s)시킨다. WorldMap.tsx와 동일한 DottedMap 파라미터를 공유해
// 착지 정합을 구조적으로 보장한다.

// 착지 dot 색 — WorldMap 베이스 dot과 동일(globals.css .vfl-map-img 기본값).
const DOT_COLOR = "#E8E2D0";
// 성능 안전 상한 — 가시 지도 dot 전체(~6.5k)와 1:1 매칭하되 이 위로는 늘리지 않는다.
const MAX_DOTS = 8000;
// 글리프 샘플 최소 간격(px). 작은 뷰포트에서 dot이 겹쳐 글자가 뭉개지는 것을 방지 —
// 이 캡에 걸리면 글리프 dot이 지도 dot보다 적어져 부분 1:1로 동작한다(잔여는 지도 페이드인).
const MIN_GLYPH_STEP = 4;
// 착지 시점 dot 알파 — 지도 dot 색 #E8E2D085의 0x85와 일치시켜 크로스페이드를 무봉제로.
const LAND_ALPHA = 0x85 / 255;
// 오프스크린 글리프 샘플링의 최소 그리드 간격(px). 실제 간격은 글자 크기에
// 맞춰 적응 — 고정 간격은 큰 뷰포트에서 후보가 수만 개로 불어나고, 이를
// uniform stride로 서브샘플하면 스캔 순서와 간섭해 모아레 물결이 생긴다.
const SAMPLE_STEP = 5;
// Header(z-900, h-16=64px) 하단 여유 — 이 위로 착지하면 헤더에 가려 고아 dot이 됨.
const HEADER_SAFE_PX = 80;
// dotted-map mask-image가 상하 12%를 투명화(globals.css .vfl-map-img) → 가시 밴드.
const BAND_TOP = 0.12;
const BAND_BOTTOM = 0.88;

// 타임라인 절대 시각(초) — LOADER_TIMELINE에서 유도(하드코딩 금지).
const FORM_END = LOADER_TIMELINE.form; // 0.8
const HOLD_END = LOADER_TIMELINE.form + LOADER_TIMELINE.hold; // 1.5
const SCENE_END = HOLD_END + LOADER_TIMELINE.scatter; // 2.5
// 배경(솔리드)은 흩어짐 시작(1.5s)부터 0.6s에 걸쳐 걷힌다.
const BG_FADE_START = HOLD_END;
const BG_FADE_DUR = 0.6;
// per-dot stagger — 형성은 0.3s 안에, 흩어짐은 0.15s 안에 분산.
const FORM_STAGGER = 0.3;
const SCATTER_STAGGER = 0.15;

// cubic-bezier(0.22, 1, 0.36, 1) — hero.tsx의 EASE와 동일. rAF에서 쓰려고 수식 구현.
function makeCubicBezier(x1: number, y1: number, x2: number, y2: number) {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const dX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    let t = x;
    for (let i = 0; i < 5; i++) {
      const xe = sampleX(t) - x;
      if (Math.abs(xe) < 1e-4) break;
      const d = dX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= xe / d;
    }
    return sampleY(Math.min(1, Math.max(0, t)));
  };
}
const ease = makeCubicBezier(0.22, 1, 0.36, 1);

interface ScreenPoint {
  x: number;
  y: number;
}

interface Dot {
  sx0: number; // 무작위 시작 x
  sy0: number; // 무작위 시작 y
  gx: number; // 글리프 좌표 x (화면)
  gy: number; // 글리프 좌표 y (화면)
  tx: number; // 지도 착지 좌표 x (화면)
  ty: number; // 지도 착지 좌표 y (화면)
  fd: number; // 형성 stagger delay
  sd: number; // 흩어짐 stagger delay
}

// 배열에서 균등 간격으로 n개 서브샘플.
function subsample<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr.slice();
  const out: T[] = [];
  for (let k = 0; k < n; k++) out.push(arr[Math.floor((k * arr.length) / n)]!);
  return out;
}

// font-display Tailwind 클래스가 참조하는 폰트 스택을 런타임에서 해석.
// (raw CSS는 var(--font-display)를 못 읽으므로 유틸리티 클래스로 우회.)
function resolveDisplayFont(): string {
  const probe = document.createElement("span");
  probe.className = "font-display";
  probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;";
  document.body.appendChild(probe);
  const family = getComputedStyle(probe).fontFamily || "sans-serif";
  document.body.removeChild(probe);
  return family;
}

// 오프스크린 canvas에 "VFL"을 렌더해 alpha 그리드 샘플링 → 화면 좌표 글리프 dot.
// targetN: 목표 dot 수 — 가시 지도 dot 수를 넘겨 받아 1:1 매칭 밀도로 샘플한다.
function sampleGlyph(fontFamily: string, targetN: number): ScreenPoint[] {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const targetW = Math.min(vw * 0.7, 900);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  // 100px 기준으로 폭을 재고 targetW에 맞춰 폰트 크기 스케일.
  ctx.font = `100px ${fontFamily}`;
  const baseW = ctx.measureText("VFL").width;
  if (!baseW) return [];
  const fontSize = (100 * targetW) / baseW;

  const pad = Math.round(fontSize * 0.15);
  const boxW = Math.ceil(targetW + pad * 2);
  const boxH = Math.ceil(fontSize * 1.25 + pad * 2);
  canvas.width = boxW;
  canvas.height = boxH;

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.fillText("VFL", boxW / 2, boxH / 2);

  const { data } = ctx.getImageData(0, 0, boxW, boxH);
  // 글리프 박스를 뷰포트 중앙에 배치.
  const originX = vw / 2 - boxW / 2;
  const originY = vh / 2 - boxH / 2;
  const collect = (step: number): ScreenPoint[] => {
    const pts: ScreenPoint[] = [];
    for (let y = 0; y < boxH; y += step) {
      for (let x = 0; x < boxW; x += step) {
        if (data[(y * boxW + x) * 4 + 3]! > 128) {
          pts.push({ x: originX + x, y: originY + y });
        }
      }
    }
    return pts;
  };
  // 1차 러프 샘플로 글리프 픽셀 면적을 추정한 뒤, 결과가 targetN 근처의
  // 균등 그리드가 되도록 step을 조정해 재샘플. 이러면 이후 N개 서브샘플이
  // 항등에 가까워져 모아레가 사라지고 dot 커버리지가 글자 크기와 무관해진다.
  const rough = collect(SAMPLE_STEP);
  const step = Math.max(
    MIN_GLYPH_STEP,
    Math.round(SAMPLE_STEP * Math.sqrt(rough.length / targetN)),
  );
  const points = step === SAMPLE_STEP ? rough : collect(step);
  console.debug(`[loader] glyph step ${step}, ${points.length} dots`);
  return points;
}

export default function DotScatterScene() {
  const reduce = useReducedMotion();
  const markDone = useLoaderMarkDone();

  const [visible, setVisible] = useState(true);
  const [degraded, setDegraded] = useState(false);
  const [fallbackFading, setFallbackFading] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const bgRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markedRef = useRef(false);
  const sceneStartRef = useRef(0); // 씬 마운트 시각 — 총 소요시간 계측용

  // markDone은 어떤 경로에서든 정확히 한 번만.
  const markOnce = () => {
    if (markedRef.current) return;
    markedRef.current = true;
    // 계획 Verification: loader 총 시간 2.3–2.7s 확인용 (씬 시작~완료 실측).
    console.debug(
      `[loader] total ${(performance.now() - sceneStartRef.current).toFixed(0)}ms`,
    );
    markDone();
  };

  useEffect(() => {
    let mounted = true;
    let raf = 0;
    let started = false; // rAF 단일 시작 가드(StrictMode 이중 이펙트 대비)
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    sceneStartRef.current = performance.now();

    // 강등: 정적 "VFL"을 form 시간 표시 후 페이드아웃, 그 뒤 markDone·언마운트.
    const degrade = () => {
      if (!mounted) return;
      setDegraded(true);
      timeouts.push(
        setTimeout(() => {
          if (mounted) setFallbackFading(true);
        }, LOADER_TIMELINE.form * 1000),
      );
      timeouts.push(
        setTimeout(() => {
          if (!mounted) return;
          markOnce();
          setVisible(false);
        }, (LOADER_TIMELINE.form + 0.4) * 1000),
      );
    };

    if (reduce) {
      degrade();
      return () => {
        mounted = false;
        cancelAnimationFrame(raf);
        timeouts.forEach(clearTimeout);
      };
    }

    (async () => {
      // 폰트 로드를 300ms까지만 대기 — 지연되면 폴백 폰트로 진행.
      try {
        await Promise.race([
          document.fonts.ready,
          new Promise((r) => setTimeout(r, 300)),
        ]);
      } catch {
        /* fonts.ready 미지원 등은 무시하고 진행 */
      }
      if (!mounted) return; // await 이후 마운트 재확인(StrictMode)

      const canvas = canvasRef.current;
      const bg = bgRef.current;
      if (!canvas || !bg) return degrade();

      // 지도 착지 좌표 — WorldMap.tsx:97과 동일 파라미터.
      const inner = document.querySelector<HTMLElement>(".vfl-map-inner");
      const wrap = document.querySelector<HTMLElement>(".vfl-map-wrap");
      if (!inner || !wrap) return degrade();
      const rect = inner.getBoundingClientRect();
      const wrapRect = wrap.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return degrade();

      let vbW: number;
      let vbH: number;
      let safe: ScreenPoint[];
      let rawCount: number;
      try {
        const map = new DottedMap({ height: 100, grid: "diagonal" });
        const points = map.getPoints();
        vbW = map.image.width;
        vbH = map.image.height;
        rawCount = points.length;
        // 화면 투영 + 안전 영역 필터(수평 wrap 가시 폭 ∩ 수직 12–88% ∩ header 하단).
        safe = points
          .map((p) => ({
            x: rect.left + (p.x / vbW) * rect.width,
            y: rect.top + (p.y / vbH) * rect.height,
            band: p.y / vbH,
          }))
          .filter(
            (p) =>
              p.x >= wrapRect.left &&
              p.x <= wrapRect.right &&
              p.band >= BAND_TOP &&
              p.band <= BAND_BOTTOM &&
              p.y >= HEADER_SAFE_PX,
          )
          .map(({ x, y }) => ({ x, y }));
      } catch {
        return degrade();
      }
      // 착지 반지름 = 지도 dot 화면 반지름(getSVG radius:0.22 → 화면 스케일).
      const landRadius = (0.22 / vbW) * rect.width;

      // 글리프 샘플링 — 가시 지도 dot 전체와 1:1 매칭이 목표라 safe 수를 밀도 타깃으로 넘긴다.
      // (모바일은 MIN_GLYPH_STEP 캡에 걸려 부분 1:1 — 잔여 지도 dot은 페이드인으로 등장.)
      let glyph: ScreenPoint[];
      try {
        glyph = sampleGlyph(resolveDisplayFont(), Math.min(safe.length, MAX_DOTS));
      } catch {
        return degrade();
      }
      if (glyph.length === 0) return degrade();

      // 불변식: 안전 영역 dot 수 ≥ N. 부족하면 N을 줄여 미매칭 글리프 dot을 남기지 않음.
      const N = Math.min(MAX_DOTS, glyph.length, safe.length);
      console.debug(
        `[loader] map dots: ${rawCount} → safe ${safe.length}, glyph ${glyph.length}, N=${N}`,
      );
      if (N === 0) return degrade();

      // x-우선 정렬 매칭(궤적 교차 최소화).
      const byX = (a: ScreenPoint, b: ScreenPoint) => a.x - b.x || a.y - b.y;
      const glyphN = subsample(glyph, N).sort(byX);
      const targetN = subsample(safe, N).sort(byX);

      const dots: Dot[] = glyphN.map((g, i) => ({
        sx0: Math.random() * window.innerWidth,
        sy0: Math.random() * window.innerHeight,
        gx: g.x,
        gy: g.y,
        tx: targetN[i]!.x,
        ty: targetN[i]!.y,
        fd: Math.random() * FORM_STAGGER,
        sd: Math.random() * SCATTER_STAGGER,
      }));

      // canvas 백킹 스토어(DPR 대응).
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      const ctx = canvas.getContext("2d");
      if (!ctx) return degrade();
      ctx.scale(dpr, dpr);

      const formRadius = Math.max(landRadius * 1.7, 1.6);
      let pointerCleared = false;
      if (started) return;
      started = true;
      const startTs = performance.now();

      const frame = (now: number) => {
        if (!mounted) return;
        const t = (now - startTs) / 1000;

        // 배경 페이드(1.5–2.1s opacity 1→0)는 별도 div opacity로.
        const bgOpacity =
          t < BG_FADE_START
            ? 1
            : Math.max(0, 1 - (t - BG_FADE_START) / BG_FADE_DUR);
        bg.style.opacity = String(bgOpacity);
        if (!pointerCleared && t >= BG_FADE_START && overlayRef.current) {
          // 걷히는 중 클릭 차단 금지.
          overlayRef.current.style.pointerEvents = "none";
          pointerCleared = true;
        }

        ctx.clearRect(0, 0, vw, vh);
        ctx.fillStyle = DOT_COLOR;
        // 착지 구간에 알파를 지도 dot(#E8E2D085)로 수렴 — 크로스페이드가 밝기 점프 없이 이어진다.
        ctx.globalAlpha =
          t <= HOLD_END
            ? 1
            : 1 + (LAND_ALPHA - 1) * Math.min(1, (t - HOLD_END) / LOADER_TIMELINE.scatter);
        // 반지름은 형성 구간에 약간 크게 시작해 착지(hold 시점)까지 수렴.
        const radius = formRadius + (landRadius - formRadius) * Math.min(1, t / HOLD_END);

        // 수천 개 dot을 개별 beginPath/fill하면 프레임 예산이 깨진다 — 단일 Path2D로 배칭.
        const path = new Path2D();
        for (let i = 0; i < dots.length; i++) {
          const d = dots[i]!;
          let px: number;
          let py: number;
          if (t < FORM_END) {
            const p = Math.min(1, Math.max(0, (t - d.fd) / (FORM_END - FORM_STAGGER)));
            const e = ease(p);
            px = d.sx0 + (d.gx - d.sx0) * e;
            py = d.sy0 + (d.gy - d.sy0) * e;
          } else if (t < HOLD_END) {
            px = d.gx;
            py = d.gy;
          } else {
            const p = Math.min(
              1,
              Math.max(0, (t - HOLD_END - d.sd) / (LOADER_TIMELINE.scatter - SCATTER_STAGGER)),
            );
            const e = ease(p);
            px = d.gx + (d.tx - d.gx) * e;
            py = d.gy + (d.ty - d.gy) * e;
          }
          path.moveTo(px + radius, py);
          path.arc(px, py, radius, 0, Math.PI * 2);
        }
        ctx.fill(path);

        if (t >= SCENE_END) {
          markOnce();
          setVisible(false);
          return;
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);
    })();

    return () => {
      mounted = false;
      cancelAnimationFrame(raf);
      timeouts.forEach(clearTimeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="vfl-loader"
          ref={overlayRef}
          className="vfl-loader"
          exit={{ opacity: 0 }}
          // 지도가 opacity 1(crossfade 0.4s)에 도달한 뒤에야 오버레이가 사라지도록
          // exit를 crossfade에서 유도(+0.1 마진). 착지 dot과 지도 dot의 이중 노출 방지.
          transition={{
            duration: LOADER_TIMELINE.crossfade + 0.1,
            ease: "easeOut",
          }}
        >
          <div ref={bgRef} className="vfl-loader-bg" aria-hidden />
          {degraded ? (
            <div
              className="vfl-loader-fallback font-display"
              style={{ opacity: fallbackFading ? 0 : 1 }}
              aria-hidden
            >
              VFL
            </div>
          ) : (
            <canvas ref={canvasRef} className="vfl-loader-canvas" aria-hidden />
          )}
          {/* Preloader의 로딩 시맨틱 유지 — 시각적으로 숨긴 status 노드. */}
          <span className="sr-only" role="status" aria-busy="true">
            Loading
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
