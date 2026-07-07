"use client";

import DotScatterScene from "./dot-scatter-scene";
import type { SceneMapData } from "./loader-context";

// 오프닝 로더: dot들이 "VFL"을 형성 → 유지 → 실제 지도 dot 좌표로 흩어져 착지.
// 지도가 있는 홈 page 전용 — 착지 좌표(mapData)는 서버에서 계산돼 prop으로 온다.
// 씬 컴포넌트가 자체 배경 페이드·완료 신호(useLoaderMarkDone)·언마운트를 관리한다.
export default function Loader({ mapData }: { mapData: SceneMapData }) {
  return <DotScatterScene mapData={mapData} />;
}
