"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { MAP_DOT_RADIUS } from "@/consts/map";
import {
  LOADER_TIMELINE,
  useLoaderMapData,
  useLoaderMarkDone,
} from "./loader-context";

// 오프닝 씬: 단일 fullscreen canvas에서 솔리드 font-display "VFL" 워드마크가
// 등장(0.5s) → 유지(0.9s — 이 구간에 아웃라인 "ENTERTAINMENT" 서브카피가 스태거
// 등장해 씬 끝까지 남는다)된 뒤, 글자 전체가 한번에 dot 입자로 해체(0.3s)되고
// 전원이 동시에 dotted-map의 실제 지도 dot 좌표로 1:1 비행(1.0s)한다.
// 해체의 탁한 중간 구간은 비대칭 이징으로 회피 — 텍스트는 늦게 빠지고(1-p²)
// dot은 빨리 들어와 커버리지가 유지된다. 솔리드 텍스트와 dot 샘플이 같은
// 글리프 래스터를 공유하므로 해체 정렬이 어긋나지 않고, WorldMap.tsx와
// 동일한 DottedMap 파라미터로 착지 정합을 구조적으로 보장한다.

// 착지 dot 색 — WorldMap 베이스 dot과 동일(globals.css .vfl-map-img 기본값).
const DOT_COLOR = "#E8E2D0";
// 성능 안전 상한 — 가시 지도 dot 전체(페이드 밴드 포함 ~8.4k, 전체 그리드 8,476)와
// 1:1 매칭이 목표라 그리드 총수보다 크게 잡는다. 초과분은 폭주 방지용 보루.
const MAX_DOTS = 9000;
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
// dotted-map mask-image(globals.css .vfl-map-img)의 그라디언트 경계 —
// 상하 12% 구간은 투명→불투명으로 감쇠한다. 하드 컷이 아니라 이 감쇠율을
// 착지 알파에 복제해 페이드 밴드의 dot까지 입자가 커버한다.
const BAND_TOP = 0.12;
const BAND_BOTTOM = 0.88;
// 마스크 감쇠가 이 미만인 dot은 사실상 안 보이므로 착지 대상에서 제외.
const MIN_MASK_ALPHA = 0.05;

// 타임라인 절대 시각(초) — LOADER_TIMELINE에서 유도(하드코딩 금지).
const REVEAL_END = LOADER_TIMELINE.reveal; // 0.5 — 워드마크 등장 완료
const DISSOLVE_START = REVEAL_END + LOADER_TIMELINE.hold; // 1.4 — 해체 시작
const SCATTER_START = DISSOLVE_START + LOADER_TIMELINE.dissolve; // 1.7 — 흩어짐 시작
const SCENE_END = SCATTER_START + LOADER_TIMELINE.scatter; // 2.7
// 배경(솔리드)은 흩어짐 시작(1.7s)부터 0.6s에 걸쳐 걷힌다.
const BG_FADE_START = SCATTER_START;
const BG_FADE_DUR = 0.6;
// 워드마크 등장 시 아래에서 살짝 떠오르는 거리 — hero rise(y:20)와 같은 문법.
const REVEAL_RISE_PX = 16;

// ── ENTERTAINMENT 서브카피 ──
// hero .vfl-h-suffix의 아웃라인 락업을 loader에서 예고하는 레이어 — loader 락업이
// 입자로 흩어졌다가 hero에서 지도 위 락업으로 재조립되는 서사. VFL보다 늦게 스태거
// 등장한 뒤 자체 퇴장 없이 씬 끝까지 남아 오버레이 exit(크로스페이드)와 함께
// 사라진다 — 솔리드(본체)는 세계로 흩어지고 아웃라인(카테고리)은 끝까지 남는 구도.
// 짧은 왕복(등장→즉시 소등)은 연출이 아니라 깜빡임으로 지각되어 배제했다.
// dot 해체에는 불참.
const ENT_TEXT = "ENTERTAINMENT";
const ENT_IN_START = REVEAL_END + 0.1; // 0.6 — VFL 등장 직후 한 박자만 띄운 스태거
const ENT_IN_DUR = 0.2;
if (process.env.NODE_ENV !== "production") {
  // 불변식: 등장 완료 < 해체 시작. ENT 오프셋(0.1/0.2)은 hold=0.9에 튜닝된
  // 하드코딩 — LOADER_TIMELINE.hold를 줄이면 VFL 해체가 시작된 뒤에야 ENT가
  // 등장을 마치는 조용한 회귀가 생기므로 dev에서 즉시 잡는다.
  console.assert(
    ENT_IN_START + ENT_IN_DUR < DISSOLVE_START,
    `[loader] ENT 타임라인 불변식 위반: in 완료 ${ENT_IN_START + ENT_IN_DUR}s ≥ 해체 시작 ${DISSOLVE_START}s`,
  );
}
// 등장 rise — VFL과 같은 이징 문법, 종속된 진폭(절반).
const ENT_RISE_PX = REVEAL_RISE_PX / 2;
// 최대 알파 — 아웃라인 조연이 솔리드 주연과 같은 성량으로 붙지 않게 살짝 낮춘다.
const ENT_ALPHA = 0.9;
// 해체 충격파의 알파 최저점 — 입자 폭발 순간(해체 구간) 눌렸다 회복해 무대 위
// 사건을 "인지"한다. 0.4 아래로 내리면 "꺼졌다 켜짐"(깜빡임)으로 읽히므로 금지.
// 정지 상태가 고아처럼 보이지 않게 하는 미세 반응 1.
const ENT_DIP_ALPHA = 0.55;
// 충격 순간의 물리 반동 — 알파와 같은 포락선으로 스케일이 1.5% 눌렸다 복귀.
// 빛(알파)과 몸(스케일)이 함께 반응해 폭발의 여파가 닿았다는 물리감을 만든다.
const ENT_RECOIL = 0.015;
// 흩어짐 동안의 슬로우 스케일업 상한 — VFL이 떠난 무대를 이어받는 미세한 생기.
// 눈치채기 어려운 수준(2.5%)이고 위치·트래킹은 불변이라 크로스페이드 구도가
// 유지된다. 미세 반응 2.
const ENT_SCALE_MAX = 1.025;
// 폰트 크기 — VFL fontSize 대비 비율. hero의 px 비율(48/108)을 그대로 이식하면
// 거대한 loader 워드마크에서 과대해지므로, 광학 폭 매칭을 전제로 작게 쓴다.
const ENT_FONT_RATIO = 0.12;
// VFL 잉크 하단 ↔ 서브카피 간격 — VFL fontSize 대비(hero margin-top 비례 환산).
const ENT_GAP_RATIO = 0.09;
// dot이 나타나는 알파 램프 시간.
const DOT_IN = 0.12;
// 해체 시작의 미세 지터 — 전면 동시 해체가 기계적으로 보이지 않게 하는 미세 반짝임.
const DISSOLVE_JITTER = 0.06;
// 비행 시작의 미세 지터 — 전원이 SCATTER_START에 "한번에" 출발하되 로봇 같지 않게.
const SCATTER_JITTER = 0.1;
// per-dot 비행 시간 — 지터가 최대인 dot도 SCENE_END에 착지하도록 유도.
const FLIGHT = LOADER_TIMELINE.scatter - SCATTER_JITTER; // 0.9
// per-dot 알파는 배칭을 위해 이 단계 수로 양자화(Path2D 버킷당 1 fill).
const ALPHA_BUCKETS = 10;

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

// 착지 후보 지도 dot — m은 그 위치의 마스크 감쇠율(0~1, 가시 알파 배율).
interface TargetPoint extends ScreenPoint {
  m: number;
}

interface Dot {
  gx: number; // 글리프 좌표 x (화면) — 해체 시 dot이 태어나는 자리
  gy: number; // 글리프 좌표 y (화면)
  tx: number; // 지도 착지 좌표 x (화면)
  ty: number; // 지도 착지 좌표 y (화면)
  tb: number; // 탄생 시각(초) — 해체 시작 + 미세 지터 (전면 동시)
  tf: number; // 비행 시작 시각(초) — 전원 SCATTER_START 기준 + 미세 지터(동시 출발)
  la: number; // 착지 알파 — 그 자리 지도 dot의 최종 가시 알파(LAND_ALPHA × 마스크 감쇠)
}

// 배열에서 균등 간격으로 n개 서브샘플.
function subsample<T>(arr: T[], n: number): T[] {
  if (arr.length <= n) return arr.slice();
  const out: T[] = [];
  for (let k = 0; k < n; k++) out.push(arr[Math.floor((k * arr.length) / n)]!);
  return out;
}

// 락업 세로 레이아웃 — VFL은 폭 기준(targetW)만으로 크기가 정해져 높이를 보장하지
// 못하고, ENT는 잉크 하단 아래로 추가 배치만 되므로 세로가 짧은 뷰포트(1366×768,
// 모바일 가로 등)에서 서브카피가 화면 아래로 밀린다. 여기서 두 가지를 보정한다:
// (1) 락업 전체 높이(VFL 잉크 + ENT 확장분)에 뷰포트 비례 상한을 걸어 targetW 축소,
// (2) ENT 확장분의 절반만큼 중심을 올려 VFL+ENT 락업의 광학 중심을 밴드 중심에 정렬.
// 반환 centerY를 글리프 샘플링과 라이브 렌더가 함께 쓰므로 해체 정렬은 유지된다.
// 상한 0.88 = 상하 6% 여유 — 포스터 스케일이 아트 디렉션이라 일반 데스크톱
// (1080p 최대화 창 포함)에서는 발동하지 않고, 실제로 넘치는 짧은 뷰포트
// (1366×768, 모바일 가로 등)에서만 워드마크를 줄인다.
const MAX_LOCKUP_VH = 0.88;

interface LockupLayout {
  /** 높이 상한 반영 후의 워드마크 목표 폭 — sampleGlyph에 그대로 전달. */
  targetW: number;
  /** VFL 잉크 광학 중심 y — ENT 확장분 절반만큼 밴드 중심에서 올라간 값. */
  centerY: number;
}

function layoutLockup(
  fontFamily: string,
  bandCenterY: number,
): LockupLayout | null {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.font = `100px ${fontFamily}`;
  const baseW = ctx.measureText("VFL").width;
  if (!baseW) return null;
  let targetW = Math.min(window.innerWidth * 0.7, 900);

  // 잉크 높이(ascent+descent 합은 baseline 선택과 무관)와 ENT 확장분을 측정.
  const measure = (tw: number) => {
    const f = (100 * tw) / baseW;
    ctx.font = `${f}px ${fontFamily}`;
    const m = ctx.measureText("VFL");
    const inkH =
      Number.isFinite(m.actualBoundingBoxAscent) &&
      Number.isFinite(m.actualBoundingBoxDescent)
        ? m.actualBoundingBoxAscent + m.actualBoundingBoxDescent
        : f * 0.72;
    ctx.font = `${f * ENT_FONT_RATIO}px ${fontFamily}`;
    const em = ctx.measureText(ENT_TEXT);
    const entAsc = Number.isFinite(em.actualBoundingBoxAscent)
      ? em.actualBoundingBoxAscent
      : f * ENT_FONT_RATIO * 0.72;
    return { inkH, entExtent: f * ENT_GAP_RATIO + entAsc };
  };

  const first = measure(targetW);
  let entExtent = first.entExtent;
  const maxH = window.innerHeight * MAX_LOCKUP_VH;
  if (first.inkH + entExtent > maxH) {
    // 모든 측정치가 폰트 크기에 선형이라 1회 스케일로 상한에 수렴한다.
    targetW *= maxH / (first.inkH + entExtent);
    entExtent = measure(targetW).entExtent;
  }
  return { targetW, centerY: bandCenterY - entExtent / 2 };
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
// 반환하는 font 문자열은 씬의 솔리드 워드마크 렌더에 그대로 재사용 —
// 같은 폰트·크기·기준선을 쓰므로 해체 시 텍스트와 dot의 정렬이 픽셀 단위로 일치한다.
interface GlyphSample {
  points: ScreenPoint[];
  font: string;
  /** 광학 중심 보정 오프셋(px) — 라이브 텍스트도 같은 값으로 그려야 정렬 유지. */
  inkShift: number;
}

// centerY: 워드마크 잉크의 광학 중심을 놓을 화면 y — 지도 밴드 중심을 넘기면
// 착지 목적지와 같은 축에 자리해 모바일(top:40%)에서도 구도가 조여진다.
// targetW: layoutLockup이 높이 상한까지 반영해 산정한 워드마크 목표 폭.
function sampleGlyph(
  fontFamily: string,
  targetN: number,
  centerY: number,
  targetW: number,
): GlyphSample {
  const vw = window.innerWidth;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return { points: [], font: "", inkShift: 0 };

  // 100px 기준으로 폭을 재고 targetW에 맞춰 폰트 크기 스케일.
  ctx.font = `100px ${fontFamily}`;
  const baseW = ctx.measureText("VFL").width;
  if (!baseW) return { points: [], font: "", inkShift: 0 };
  const fontSize = (100 * targetW) / baseW;

  const pad = Math.round(fontSize * 0.15);
  const boxW = Math.ceil(targetW + pad * 2);
  const boxH = Math.ceil(fontSize * 1.25 + pad * 2);
  canvas.width = boxW;
  canvas.height = boxH;

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // 광학 중심 보정 — "VFL"은 디센더가 없어 middle 베이스라인(em 박스 기준)으로
  // 그리면 잉크가 위로 쏠린다. 잉크 bbox의 중심이 박스 중앙에 오도록 내린다.
  const m = ctx.measureText("VFL");
  const inkShift =
    Number.isFinite(m.actualBoundingBoxAscent) &&
    Number.isFinite(m.actualBoundingBoxDescent)
      ? (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2
      : fontSize * 0.06;
  ctx.fillStyle = "#fff";
  ctx.fillText("VFL", boxW / 2, boxH / 2 + inkShift);

  const { data } = ctx.getImageData(0, 0, boxW, boxH);
  // 글리프 박스를 잉크의 광학 중심이 centerY에 오도록 배치.
  const originX = vw / 2 - boxW / 2;
  const originY = centerY - boxH / 2;
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
  if (process.env.NODE_ENV !== "production") {
    console.debug(`[loader] glyph step ${step}, ${points.length} dots`);
  }
  return { points, font: `${fontSize}px ${fontFamily}`, inkShift };
}

export default function DotScatterScene() {
  const reduce = useReducedMotion();
  const markDone = useLoaderMarkDone();
  const mapData = useLoaderMapData();

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
    // 계획 Verification: loader 총 시간 2.5–2.9s 확인용 (씬 시작~완료 실측).
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        `[loader] total ${(performance.now() - sceneStartRef.current).toFixed(0)}ms`,
      );
    }
    markDone();
  };

  useEffect(() => {
    let mounted = true;
    let raf = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    sceneStartRef.current = performance.now();

    // 강등: 정적 "VFL"을 reveal+hold 시간 표시 후 페이드아웃, 그 뒤 markDone·언마운트.
    const degrade = () => {
      if (!mounted) return;
      setDegraded(true);
      const showFor = LOADER_TIMELINE.reveal + LOADER_TIMELINE.hold;
      timeouts.push(
        setTimeout(() => {
          if (mounted) setFallbackFading(true);
        }, showFor * 1000),
      );
      timeouts.push(
        setTimeout(() => {
          if (!mounted) return;
          markOnce();
          setVisible(false);
        }, (showFor + 0.4) * 1000),
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

      // 착지 좌표 — 지도 dot은 서버에서 계산돼 loader-context로 주입된다
      // (WorldMap과 동일한 {height:100, grid:"diagonal"} 산출물). 클라이언트는
      // dotted-map을 로드하지 않는다.
      if (!mapData) return degrade();
      const inner = document.querySelector<HTMLElement>(".vfl-map-inner");
      const wrap = document.querySelector<HTMLElement>(".vfl-map-wrap");
      if (!inner || !wrap) return degrade();
      const rect = inner.getBoundingClientRect();
      const wrapRect = wrap.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return degrade();

      const vbW = mapData.width;
      const vbH = mapData.height;
      const flat = mapData.pointsFlat; // [x0, y0, x1, y1, …]
      const rawCount = flat.length / 2;
      // 화면 투영 + 안전 영역 필터(수평 wrap 가시 폭 ∩ 마스크 가시(감쇠 포함) ∩ header 하단).
      // 상하 페이드 밴드의 dot도 마스크 감쇠율(m)을 계산해 착지 대상에 포함한다 —
      // 크로스페이드 순간 입자 없이 나타나는 dot이 없도록 "모든 가시 dot은 입자에서 태어난다".
      const safe: TargetPoint[] = [];
      for (let i = 0; i + 1 < flat.length; i += 2) {
        const px = flat[i]!;
        const py = flat[i + 1]!;
        const band = py / vbH;
        const m =
          band < BAND_TOP
            ? band / BAND_TOP
            : band > BAND_BOTTOM
              ? (1 - band) / (1 - BAND_BOTTOM)
              : 1;
        const x = rect.left + (px / vbW) * rect.width;
        const y = rect.top + (py / vbH) * rect.height;
        if (
          x >= wrapRect.left &&
          x <= wrapRect.right &&
          m >= MIN_MASK_ALPHA &&
          y >= HEADER_SAFE_PX
        ) {
          safe.push({ x, y, m });
        }
      }
      // 착지 반지름 = 지도 dot 화면 반지름(MAP_DOT_RADIUS → 화면 스케일).
      const landRadius = (MAP_DOT_RADIUS / vbW) * rect.width;

      // 글리프 샘플링 — 가시 지도 dot 전체와 1:1 매칭이 목표라 safe 수를 밀도 타깃으로 넘긴다.
      // (모바일은 MIN_GLYPH_STEP 캡에 걸려 부분 1:1 — 잔여 지도 dot은 페이드인으로 등장.)
      // VFL+ENT 락업의 광학 중심을 지도 밴드 중심에 정렬 — layoutLockup이 ENT
      // 확장분의 절반만큼 올린 centerY와 높이 상한 반영 targetW를 산정하고,
      // 샘플링·라이브 렌더가 같은 값을 쓰므로 해체 정렬과 착지 정합이 유지된다.
      const bandCenterY = rect.top + rect.height / 2;
      let glyph: ScreenPoint[];
      let glyphFont: string;
      let inkShift: number;
      let fontFamily: string;
      let glyphCenterY: number;
      try {
        fontFamily = resolveDisplayFont();
        const lockup = layoutLockup(fontFamily, bandCenterY);
        if (!lockup) return degrade();
        glyphCenterY = lockup.centerY;
        const sampled = sampleGlyph(
          fontFamily,
          Math.min(safe.length, MAX_DOTS),
          glyphCenterY,
          lockup.targetW,
        );
        glyph = sampled.points;
        glyphFont = sampled.font;
        inkShift = sampled.inkShift;
      } catch {
        return degrade();
      }
      if (glyph.length === 0) return degrade();

      // 불변식: 안전 영역 dot 수 ≥ N. 부족하면 N을 줄여 미매칭 글리프 dot을 남기지 않음.
      const N = Math.min(MAX_DOTS, glyph.length, safe.length);
      if (process.env.NODE_ENV !== "production") {
        console.debug(
          `[loader] map dots: ${rawCount} → safe ${safe.length}, glyph ${glyph.length}, N=${N}`,
        );
      }
      if (N === 0) return degrade();

      // x-우선 정렬 매칭(궤적 교차 최소화).
      const byX = (a: ScreenPoint, b: ScreenPoint) => a.x - b.x || a.y - b.y;
      const glyphN = subsample(glyph, N).sort(byX);
      const targetN = subsample(safe, N).sort(byX);

      const dots: Dot[] = glyphN.map((g, i) => ({
        gx: g.x,
        gy: g.y,
        tx: targetN[i]!.x,
        ty: targetN[i]!.y,
        la: LAND_ALPHA * targetN[i]!.m,
        // 글자 전체가 한번에 입자화 — 미세 지터만으로 반짝이며 태어나는 질감.
        tb: DISSOLVE_START + Math.random() * DISSOLVE_JITTER,
        // 해체가 끝난 완전한 dot 워드마크가 한 호흡에 세계로 흩어진다.
        tf: SCATTER_START + Math.random() * SCATTER_JITTER,
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

      // ENTERTAINMENT 락업 레이아웃 — 트래킹을 벌려 VFL 워드마크와 광학 폭을
      // 일치시키는 저스티파이. per-char x를 미리 계산해 매 프레임 strokeText만
      // 수행한다(ctx.letterSpacing 브라우저 지원과 무관하게 폭 매칭이 성립).
      ctx.font = glyphFont;
      ctx.textBaseline = "middle"; // 잉크 하단을 VFL 실제 렌더 기준선으로 측정
      const vflSize = parseFloat(glyphFont) || 100;
      const vflMetrics = ctx.measureText("VFL");
      const vflBottom =
        glyphCenterY +
        inkShift +
        (Number.isFinite(vflMetrics.actualBoundingBoxDescent)
          ? vflMetrics.actualBoundingBoxDescent
          : vflSize * 0.36);
      const entFont = `${vflSize * ENT_FONT_RATIO}px ${fontFamily}`;
      ctx.font = entFont;
      ctx.textBaseline = "alphabetic";
      const entChars = [...ENT_TEXT];
      const charWs = entChars.map((c) => ctx.measureText(c).width);
      const naturalW = charWs.reduce((a, b) => a + b, 0);
      const entGap = Math.max(
        0,
        (vflMetrics.width - naturalW) / (entChars.length - 1),
      );
      const entXs: number[] = [];
      let entPen = vw / 2 - (naturalW + entGap * (entChars.length - 1)) / 2;
      for (const w of charWs) {
        entXs.push(entPen);
        entPen += w + entGap;
      }
      const entM = ctx.measureText(ENT_TEXT);
      const entAscentPx = Number.isFinite(entM.actualBoundingBoxAscent)
        ? entM.actualBoundingBoxAscent
        : vflSize * ENT_FONT_RATIO * 0.72;
      const entBaselineY = vflBottom + vflSize * ENT_GAP_RATIO + entAscentPx;
      // 스케일 응답의 기준점 — 대문자 잉크의 광학 중심(세로 중앙).
      const entMidY = entBaselineY - entAscentPx / 2;

      // 해체 직후 dot 반지름 — 살짝 크게 시작해 "부서진 파편" 질감을 주고,
      // 각 dot의 비행 진행도에 따라 착지 순간 지도 dot 크기로 정확히 수렴.
      const dissolveRadius = Math.max(landRadius * 1.7, 1.6);
      let pointerCleared = false;
      const startTs = performance.now();

      const frame = (now: number) => {
        if (!mounted) return;
        const t = (now - startTs) / 1000;

        // 배경 페이드(1.7–2.3s opacity 1→0)는 별도 div opacity로.
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

        // 1) 솔리드 워드마크 — 등장(rise+fade) → 유지 → 전면 동시 해체로 소멸.
        //    샘플링과 동일한 font 문자열·중앙 기준선을 쓰므로 dot과 픽셀 정렬이 일치.
        if (t < DISSOLVE_START) {
          const a = t < REVEAL_END ? ease(t / REVEAL_END) : 1;
          const rise =
            t < REVEAL_END ? (1 - ease(t / REVEAL_END)) * REVEAL_RISE_PX : 0;
          ctx.globalAlpha = Math.min(1, Math.max(0, a));
          ctx.font = glyphFont;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = DOT_COLOR;
          ctx.fillText("VFL", vw / 2, glyphCenterY + inkShift + rise);
        } else if (t < SCATTER_START) {
          // 전면 동시 해체 — 텍스트는 1-p²로 늦게 빠지고 dot은 DOT_IN으로 빨리
          // 들어와, 크로스페이드 중간의 탁한 커버리지 딥이 생기지 않는다.
          const wp = Math.min(1, (t - DISSOLVE_START) / LOADER_TIMELINE.dissolve);
          ctx.globalAlpha = Math.max(0, 1 - wp * wp);
          ctx.font = glyphFont;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = DOT_COLOR;
          ctx.fillText("VFL", vw / 2, glyphCenterY + inkShift);
        }

        // 1.5) ENTERTAINMENT 서브카피 — VFL 유지 중 스태거 등장(동일 이징, 절반
        //      진폭) 후 씬 끝까지 유지 — 퇴장은 오버레이 exit가 맡는다. hero
        //      .vfl-h-suffix와 같은 1px 아웃라인 스트로크로, 솔리드→아웃라인
        //      위계를 loader에서 예고한다. 유지 중에도 무대의 사건에 미세하게
        //      반응한다: 해체 순간 알파 딥(충격파) + 흩어짐 동안 슬로우 스케일업.
        if (t >= ENT_IN_START) {
          const aIn =
            t < ENT_IN_START + ENT_IN_DUR
              ? ease((t - ENT_IN_START) / ENT_IN_DUR)
              : 1;
          // 해체 충격파 포락선(0→1→0) — 실제 충격의 문법대로 빠르게 눌리고
          // (해체의 1/3) 천천히 회복(2/3)하는 비대칭. 알파와 스케일 반동이 공유.
          let dip = 0;
          if (t >= DISSOLVE_START && t < SCATTER_START) {
            const hit = LOADER_TIMELINE.dissolve / 3;
            dip =
              t < DISSOLVE_START + hit
                ? ease((t - DISSOLVE_START) / hit)
                : 1 -
                  ease(
                    (t - DISSOLVE_START - hit) /
                      (LOADER_TIMELINE.dissolve - hit),
                  );
          }
          const alpha = ENT_ALPHA * aIn + (ENT_DIP_ALPHA - ENT_ALPHA) * dip;
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
          ctx.font = entFont;
          ctx.textAlign = "left";
          ctx.textBaseline = "alphabetic";
          ctx.lineWidth = 1;
          ctx.strokeStyle = DOT_COLOR;
          const entRise = (1 - aIn) * ENT_RISE_PX;
          // 슬로우 스케일업(흩어짐 진행도) × 충격 반동(해체 포락선) — 광학 중심 기준.
          // 반동은 1.7s에 0으로 수렴하고 스케일업이 그 지점에서 시작해 연속적이다.
          const sp =
            t >= SCATTER_START
              ? Math.min(1, (t - SCATTER_START) / LOADER_TIMELINE.scatter)
              : 0;
          const entScale =
            (1 + (ENT_SCALE_MAX - 1) * ease(sp)) * (1 - ENT_RECOIL * dip);
          ctx.save();
          ctx.translate(vw / 2, entMidY);
          ctx.scale(entScale, entScale);
          ctx.translate(-vw / 2, -entMidY);
          for (let i = 0; i < entChars.length; i++) {
            ctx.strokeText(entChars[i]!, entXs[i]!, entBaselineY + entRise);
          }
          ctx.restore();
        }

        // 2) dot 입자 — 전면 동시 해체(미세 지터)로 태어나 알파 인(DOT_IN) → 동시 출발로 비행·착지.
        //    비행 진행도에 따라 알파를 지도 dot(#E8E2D085)로 수렴시켜 크로스페이드 밝기 점프 제거.
        //    per-dot 알파는 ALPHA_BUCKETS 단계로 양자화해 버킷당 Path2D 1회 fill로 배칭 —
        //    수천 개 dot을 개별 fill하면 프레임 예산이 깨진다.
        if (t >= DISSOLVE_START) {
          const buckets: (Path2D | undefined)[] = new Array(ALPHA_BUCKETS + 1);
          for (let i = 0; i < dots.length; i++) {
            const d = dots[i]!;
            if (t < d.tb) continue; // 아직 태어나지 않은 dot (해체 지터)
            const aIn = Math.min(1, (t - d.tb) / DOT_IN);
            const p = Math.min(1, Math.max(0, (t - d.tf) / FLIGHT));
            const alpha = aIn * (1 + (d.la - 1) * p);
            const bi = Math.round(alpha * ALPHA_BUCKETS);
            if (bi <= 0) continue;
            const e = ease(p);
            const px = d.gx + (d.tx - d.gx) * e;
            const py = d.gy + (d.ty - d.gy) * e;
            const radius = dissolveRadius + (landRadius - dissolveRadius) * e;
            const path = (buckets[bi] ??= new Path2D());
            path.moveTo(px + radius, py);
            path.arc(px, py, radius, 0, Math.PI * 2);
          }
          ctx.fillStyle = DOT_COLOR;
          for (let bi = 1; bi <= ALPHA_BUCKETS; bi++) {
            const path = buckets[bi];
            if (!path) continue;
            ctx.globalAlpha = bi / ALPHA_BUCKETS;
            ctx.fill(path);
          }
        }
        ctx.globalAlpha = 1;

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
              {/* 모션 여부와 무관하게 모든 사용자가 같은 락업을 보도록 폴백에도 표기. */}
              <span className="vfl-loader-fallback-suffix">{ENT_TEXT}</span>
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
