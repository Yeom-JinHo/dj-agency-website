"use client";

import DotScatterScene from "./dot-scatter-scene";

// 오프닝 로더: dot들이 "VFL"을 형성 → 유지 → 실제 지도 dot 좌표로 흩어져 착지.
// 씬 컴포넌트가 자체 배경 페이드·완료 신호(useLoaderMarkDone)·언마운트를 관리한다.
export default function Loader() {
  return <DotScatterScene />;
}
