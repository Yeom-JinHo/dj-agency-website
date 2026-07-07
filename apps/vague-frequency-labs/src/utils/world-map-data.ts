import { cache } from "react";
import DottedMap from "dotted-map";
import { hero, type HeroCity } from "@/app/sections/hero/config";

// Server-only: builds the dotted world map ONCE (this pulls dotted-map's ~350KB
// country GeoJSON) and returns only serializable results, so the heavy library
// never ships to the client. Import the VALUE (getWorldMapData) exclusively from
// server components; client components must `import type` from here so the
// dotted-map dependency is erased at compile time.

export interface MapPoint {
  x: number;
  y: number;
}

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
  /** Every land dot, in viewBox coords — shared by the map SVG and the loader. */
  points: MapPoint[];
  /** Static city pins, pre-projected server-side (cities are a fixed config). */
  placed: PlacedPin[];
}

// cache(): within a single server render, layout (loader scene) and page (hero)
// both call this but the DottedMap build runs only once. Under static prerender
// this collapses to a single build-time computation.
export const getWorldMapData = cache((): WorldMapData => {
  const map = new DottedMap({ height: 100, grid: "diagonal" });
  const { width, height } = map.image;
  const points: MapPoint[] = map.getPoints().map((p) => ({ x: p.x, y: p.y }));
  const placed: PlacedPin[] = hero.cities
    .map((c: HeroCity) => {
      const pin = map.getPin({ lat: c.lat, lng: c.lng });
      return pin ? { id: c.id, x: pin.x, y: pin.y } : null;
    })
    .filter((p): p is PlacedPin => p !== null);
  return { width, height, points, placed };
});
