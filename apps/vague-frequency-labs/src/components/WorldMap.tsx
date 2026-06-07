"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import DottedMap from "dotted-map";

export interface WorldMapCity {
  id: string;
  name: string;
  displayCountry: string;
  flagCountryCode: string;
  venue: string;
  lat: number;
  lng: number;
}

interface WorldMapProps {
  cities: WorldMapCity[];
  /** id of the home city all arcs route back to. */
  homeId: string;
  /** Dot color of the base dotted map (CSS color, alpha allowed). */
  dotColor?: string;
  /** Stroke color of the arc + pins. */
  lineColor?: string;
  /** Seconds to delay the standing arcs' staggered draw-in (sync with entrance). */
  revealDelay?: number;
}

interface PlacedCity {
  city: WorldMapCity;
  x: number;
  y: number;
}

// A point on Seoul's side of the arc gets lifted to form the curve.
function curvedPath(a: PlacedCity, b: PlacedCity) {
  const midX = (a.x + b.x) / 2;
  const lift = Math.hypot(a.x - b.x, a.y - b.y) * 0.18;
  const midY = (a.y + b.y) / 2 - lift;
  return `M ${a.x} ${a.y} Q ${midX} ${midY} ${b.x} ${b.y}`;
}

export function WorldMap({
  cities,
  homeId,
  dotColor = "#E8E2D085",
  lineColor = "#E8E2D0",
  revealDelay = 0,
}: WorldMapProps) {
  const reduce = useReducedMotion();
  const [active, setActive] = useState<string | null>(null);

  // Build the dotted map once. dotted-map caches its grid internally, and
  // getPin projects lon/lat into the SAME coordinate space as the SVG viewBox,
  // so HTML pins placed by percentage line up exactly with the rendered dots.
  const { svg, width, height, placed } = useMemo(() => {
    const map = new DottedMap({ height: 100, grid: "diagonal" });
    const svgMap = map.getSVG({
      radius: 0.22,
      color: dotColor,
      shape: "circle",
      backgroundColor: "transparent",
    });
    const { width: w, height: h } = map.image;
    const placedCities = cities
      .map((city) => {
        const pin = map.getPin({ lat: city.lat, lng: city.lng });
        return pin ? { city, x: pin.x, y: pin.y } : null;
      })
      .filter((p): p is PlacedCity => p !== null);
    return { svg: svgMap, width: w, height: h, placed: placedCities };
  }, [cities, dotColor]);

  const home = placed.find((p) => p.city.id === homeId) ?? null;
  // Every non-home city keeps a standing arc back to the home base so the
  // "Seoul → everywhere" hub reads at rest; hovering a city isolates its arc.
  const arcs = home
    ? placed
        .filter((p) => p.city.id !== homeId)
        .map((p) => ({ id: p.city.id, d: curvedPath(p, home) }))
    : [];

  return (
    // Decorative map: the pins enhance the visual but carry no content that
    // isn't ambient, so the whole subtree is hidden from assistive tech.
    <div
      className="vfl-map-inner"
      style={{ aspectRatio: `${width} / ${height}` }}
      aria-hidden
    >
      {/* Inline data-URI SVG — next/image offers no benefit and can't optimize it. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`}
        className="vfl-map-img"
        alt=""
        draggable={false}
      />

      <svg
        className="vfl-map-overlay"
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        aria-hidden
      >
        <defs>
          <linearGradient id="vfl-arc-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0" />
            <stop offset="15%" stopColor={lineColor} stopOpacity="0.7" />
            <stop offset="85%" stopColor={lineColor} stopOpacity="0.7" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        {arcs.map(({ id, d }, i) => {
          const focused = active !== null;
          const isActiveArc = active === id;
          // Rest: all arcs faint. Focused: active arc bright, the rest fade out.
          const opacity = !focused ? 0.34 : isActiveArc ? 0.95 : 0;
          return (
            <motion.path
              key={id}
              d={d}
              stroke="url(#vfl-arc-gradient)"
              strokeDasharray="1.4 2.4"
              initial={
                reduce
                  ? { pathLength: 1, opacity: 0.34 }
                  : { pathLength: 0, opacity: 0 }
              }
              animate={{
                pathLength: 1,
                opacity,
                strokeWidth: isActiveArc ? 0.7 : 0.4,
              }}
              transition={{
                pathLength: {
                  duration: reduce ? 0 : 0.9,
                  delay: reduce ? 0 : revealDelay + i * 0.12,
                  ease: "easeOut",
                },
                opacity: { duration: 0.45, ease: "easeOut" },
                strokeWidth: { duration: 0.2 },
              }}
            />
          );
        })}
      </svg>

      <div className="vfl-pin-layer">
        {placed.map((p) => {
          const isHome = p.city.id === homeId;
          const isActive = active === p.city.id || isHome;
          const flipUp = p.y / height > 0.62;
          return (
            <div
              key={p.city.id}
              className="vfl-pin"
              style={{
                left: `${(p.x / width) * 100}%`,
                top: `${(p.y / height) * 100}%`,
                zIndex: active === p.city.id ? 40 : isHome ? 20 : 10,
              }}
              onMouseEnter={() => setActive(p.city.id)}
              onMouseLeave={() =>
                setActive((a) => (a === p.city.id ? null : a))
              }
              onClick={() =>
                setActive((a) => (a === p.city.id ? null : p.city.id))
              }
            >
              {!reduce && (
                <>
                  <span
                    className={`vfl-pin-pulse${isHome ? " home" : ""}`}
                  />
                  <span
                    className={`vfl-pin-pulse delay${isHome ? " home" : ""}`}
                  />
                </>
              )}
              <span className={`vfl-pin-core${isHome ? " home" : ""}`} />

              {/* Flag badge floats on the opposite side of the pin from the
                  tooltip, so the two never overlap (bottom-third cities flip
                  the tooltip up, so their flag drops below). */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://flagcdn.com/${p.city.flagCountryCode.toLowerCase()}.svg`}
                className={`vfl-pin-flag${isActive ? " show" : ""}`}
                style={
                  flipUp
                    ? { top: "calc(100% + 8px)" }
                    : { bottom: "calc(100% + 8px)" }
                }
                alt=""
                aria-hidden
                draggable={false}
                loading="lazy"
              />

              <div
                className={`vfl-pin-tip${isActive ? " show" : ""}`}
                style={
                  flipUp
                    ? { bottom: "calc(100% + 10px)" }
                    : { top: "calc(100% + 10px)" }
                }
              >
                <div className="vfl-pin-tip-head">
                  <span className="vfl-pin-tip-name">{p.city.name}</span>
                  <span className="vfl-pin-tip-cc">{p.city.displayCountry}</span>
                </div>
                <div className="vfl-pin-tip-venue">
                  {isHome ? "★ " : ""}
                  {p.city.venue}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
