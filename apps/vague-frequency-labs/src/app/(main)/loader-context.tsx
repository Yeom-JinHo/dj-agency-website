"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

// 오프닝 시퀀스 타임라인 (초 단위, 단일 소스).
// dot-scatter-scene의 rAF 타임라인과 hero 오케스트레이션이 이 상수를 공유해
// 타이밍을 한 곳에서 조정한다. 값 변경 시 씬·hero가 함께 따라간다.
export const LOADER_TIMELINE = {
  reveal: 0.5, // 솔리드 "VFL" 워드마크 등장 (rise + fade-in)
  hold: 1.0, // 워드마크 유지 — ENTERTAINMENT 서브카피의 스태거 등장·노출 구간 포함
  dissolve: 0.3, // 해체 — 솔리드 텍스트가 같은 자리의 dot 입자로 크로스페이드
  scatter: 1.0, // 흩어짐 + 지도 좌표 착지
  total: 2.8, // reveal + hold + dissolve + scatter
  // 착지 dot → 실제 지도 dot 크로스페이드 구간.
  // globals.css `.vfl-map-img { transition: opacity 0.4s }`와 반드시 동기 —
  // 한쪽을 바꾸면 다른 쪽도 함께 바꿀 것. 씬 오버레이 exit는 이 값에서 유도해
  // 지도가 opacity 1에 도달한 뒤에야 오버레이가 사라지도록 구조적으로 보장한다.
  crossfade: 0.4,
} as const;

// watchdog은 씬 타임라인보다 반드시 늦게 발화해야 하므로 total에서 유도한다.
// 하드코딩 금지 — 타임라인을 늘려도 watchdog이 씬보다 먼저 터지지 않는다.
export const WATCHDOG_MS = (LOADER_TIMELINE.total + 0.5) * 1000;

// Map data the loader scene needs for its landing coordinates. Computed on the
// server and threaded in as a prop so the client never imports dotted-map.
// pointsFlat is [x0, y0, x1, y1, …] — same compact format as WorldMapData.
export interface SceneMapData {
  pointsFlat: number[];
  width: number;
  height: number;
}

interface LoaderContextValue {
  done: boolean;
  markDone: () => void;
  mapData: SceneMapData | null;
}

const LoaderContext = createContext<LoaderContextValue | null>(null);

export function LoaderProvider({
  children,
  mapData = null,
}: {
  children: ReactNode;
  mapData?: SceneMapData | null;
}) {
  const [done, setDone] = useState(false);

  const markDone = useCallback(() => setDone(true), []);

  useEffect(() => {
    // fail-open 보험: 씬이 어떤 이유로든(예외·좌표 측정 실패·rAF 미시작) markDone을
    // 호출하지 못해도, watchdog이 무조건 done을 세워 hero가 영구 게이팅되지 않게 한다.
    // 씬이 정상 완료하면 이보다 먼저 done이 되고, 이 타이머는 무해하게 흐른다.
    const id = setTimeout(() => setDone(true), WATCHDOG_MS);
    return () => clearTimeout(id);
  }, []);

  return (
    <LoaderContext.Provider value={{ done, markDone, mapData }}>
      {children}
    </LoaderContext.Provider>
  );
}

function useLoaderContext(): LoaderContextValue {
  const ctx = useContext(LoaderContext);
  if (ctx === null) {
    throw new Error("useLoader hooks must be used within a LoaderProvider");
  }
  return ctx;
}

export function useLoaderDone(): boolean {
  return useLoaderContext().done;
}

export function useLoaderMarkDone(): () => void {
  return useLoaderContext().markDone;
}

export function useLoaderMapData(): SceneMapData | null {
  return useLoaderContext().mapData;
}
