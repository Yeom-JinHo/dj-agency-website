import "server-only";

import { cache } from "react";
import DottedMap from "dotted-map";
import { hero, type HeroCity } from "@/app/sections/hero/config";

// Server-only: builds the dotted world map ONCE (this pulls dotted-map's ~350KB
// country GeoJSON) and returns only serializable results, so the heavy library
// never ships to the client. The "server-only" import turns an accidental value
// import from a client component into a build error; client components can
// still `import type` from here (types are erased at compile time).

/** A city pin already projected into the map's viewBox coordinate space. */
export interface PlacedPin {
  id: string;
  x: number;
  y: number;
}

export interface WorldMapData {
  /** viewBox width/height (dotted-map image dims). */
  width: number;
  height: number;
  /**
   * Every land dot as flat [x0, y0, x1, y1, …] pairs in viewBox coords, shared
   * by the map SVG and the loader. Flat + quantized (1 decimal) instead of
   * {x,y} objects: dotted-map emits float-noise coordinates (up to 16
   * decimals), so this cuts the serialized RSC payload ~271KB → ~78KB. One
   * decimal in a 198-unit-wide viewBox is <0.5px on a 1920px render, and both
   * consumers read the SAME quantized values so their alignment stays exact.
   */
  pointsFlat: number[];
  /** Static city pins, pre-projected server-side (cities are a fixed config). */
  placed: PlacedPin[];
}

// 1-decimal quantization — see WorldMapData.pointsFlat.
const quantize = (v: number) => Math.round(v * 10) / 10;

// cache(): within a single server render, layout (loader scene) and page (hero)
// both call this but the DottedMap build runs only once. Under static prerender
// this collapses to a single build-time computation.
export const getWorldMapData = cache((): WorldMapData => {
  const map = new DottedMap({ height: 100, grid: "diagonal" });
  const { width, height } = map.image;
  const pointsFlat: number[] = [];
  for (const p of map.getPoints()) {
    pointsFlat.push(quantize(p.x), quantize(p.y));
  }
  const placed: PlacedPin[] = hero.cities
    .map((c: HeroCity) => {
      const pin = map.getPin({ lat: c.lat, lng: c.lng });
      return pin ? { id: c.id, x: pin.x, y: pin.y } : null;
    })
    .filter((p): p is PlacedPin => p !== null);
  return { width, height, pointsFlat, placed };
});
