"use client";

import type { COBEOptions } from "cobe";
import { useEffect, useId, useRef, useState } from "react";
import createGlobe from "cobe";
import { useMotionValue, useSpring } from "motion/react";

import { cn } from "@repo/ui";

import { ARTIST_NAME } from "@/consts/artist";

const ORBIT_TEXT = `${Object.values(ARTIST_NAME).join(" · ")} · `;
const ORBIT_TEXT_REPEAT_MOBILE = 2;
const ORBIT_TEXT_REPEAT_DESKTOP = 4;

const MOVEMENT_DAMPING = 1400;
const MOBILE_BREAKPOINT = 768;
const LARGE_DESKTOP_BREAKPOINT = 1920;
const MAX_DEVICE_PIXEL_RATIO = 1.5;
const MOBILE_MAP_SAMPLES = 4000;
const DESKTOP_MAP_SAMPLES = 6000;
const LARGE_DESKTOP_MAP_SAMPLES = 8000;
const VISIBILITY_ROOT_MARGIN = "200px 0px";
const VISIBILITY_THRESHOLD = 0.05;

type GlobeRenderProfile = {
  devicePixelRatio: number;
  mapSamples: number;
};

const DEFAULT_RENDER_PROFILE: GlobeRenderProfile = {
  devicePixelRatio: 1,
  mapSamples: DESKTOP_MAP_SAMPLES,
};

function getGlobeRenderProfile(
  viewportWidth: number,
  currentDevicePixelRatio: number,
): GlobeRenderProfile {
  return {
    devicePixelRatio: Math.min(
      currentDevicePixelRatio || 1,
      MAX_DEVICE_PIXEL_RATIO,
    ),
    mapSamples:
      viewportWidth < MOBILE_BREAKPOINT
        ? MOBILE_MAP_SAMPLES
        : viewportWidth > LARGE_DESKTOP_BREAKPOINT
          ? LARGE_DESKTOP_MAP_SAMPLES
          : DESKTOP_MAP_SAMPLES,
  };
}

const SEOUL: [number, number] = [37.5665, 126.978];

type CityMarker = {
  id: string;
  name: string;
  location: [number, number];
};

const SEOUL_MARKER: CityMarker = {
  id: "seoul",
  name: "Seoul",
  location: SEOUL,
};

const FLIGHT_DESTINATIONS: CityMarker[] = [
  { id: "tokyo", name: "Tokyo", location: [35.6762, 139.6503] },
  { id: "bangkok", name: "Bangkok", location: [13.7563, 100.5018] },
  { id: "sydney", name: "Sydney", location: [-33.8688, 151.2093] },
  { id: "paris", name: "Paris", location: [48.8566, 2.3522] },
  { id: "la", name: "Los Angeles", location: [34.0522, -118.2437] },
];

const ALL_MARKERS: CityMarker[] = [SEOUL_MARKER, ...FLIGHT_DESTINATIONS];

// cobe `showcase: default` 색·치수에 맞춘 globe config
const ACCENT: [number, number, number] = [0.3, 0.45, 0.85];
const MARKER_SIZE = 0.04;

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 1.5,
  mapSamples: DESKTOP_MAP_SAMPLES,
  mapBrightness: 6,
  baseColor: [1, 1, 1],
  markerColor: ACCENT,
  glowColor: [0.94, 0.93, 0.91],
  opacity: 0.9,
  markers: ALL_MARKERS.map(({ id, location }) => ({
    id,
    location,
    size: MARKER_SIZE,
  })),
  markerElevation: 0.01,
};

export default function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  config?: COBEOptions;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const phiRef = useRef(0);
  const widthRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);
  const [renderProfile, setRenderProfile] = useState<GlobeRenderProfile>(() =>
    typeof window === "undefined"
      ? DEFAULT_RENDER_PROFILE
      : getGlobeRenderProfile(window.innerWidth, window.devicePixelRatio || 1),
  );

  const r = useMotionValue(0);
  const rs = useSpring(r, {
    mass: 1,
    damping: 30,
    stiffness: 100,
  });

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      r.set(r.get() + delta / MOVEMENT_DAMPING);
    }
  };

  const reactId = useId();
  const orbitPathId = `orbit-${reactId.replace(/:/g, "")}`;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry?.isIntersecting ?? true);
      },
      {
        rootMargin: VISIBILITY_ROOT_MARGIN,
        threshold: VISIBILITY_THRESHOLD,
      },
    );

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const updateRenderProfile = () => {
      const nextRenderProfile = getGlobeRenderProfile(
        window.innerWidth,
        window.devicePixelRatio || 1,
      );

      setRenderProfile((currentRenderProfile) =>
        currentRenderProfile.devicePixelRatio ===
          nextRenderProfile.devicePixelRatio &&
        currentRenderProfile.mapSamples === nextRenderProfile.mapSamples
          ? currentRenderProfile
          : nextRenderProfile,
      );
    };

    window.addEventListener("resize", updateRenderProfile);
    updateRenderProfile();

    return () => {
      window.removeEventListener("resize", updateRenderProfile);
    };
  }, []);

  useEffect(() => {
    if (!isVisible || !canvasRef.current) {
      return;
    }

    const { devicePixelRatio, mapSamples } = renderProfile;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let globe: ReturnType<typeof createGlobe> | null = null;

    const onResize = () => {
      const next = canvasRef.current?.offsetWidth ?? 0;
      if (next === widthRef.current) {
        return;
      }
      widthRef.current = next;
      globe?.update({ width: next, height: next });
    };

    widthRef.current = canvasRef.current?.offsetWidth ?? 0;
    window.addEventListener("resize", onResize);

    globe = createGlobe(canvasRef.current, {
      ...config,
      devicePixelRatio,
      mapSamples,
      width: widthRef.current,
      height: widthRef.current,
    });

    let rafId = 0;
    let lastPhi = Number.NaN;
    const tick = () => {
      if (document.hidden) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      if (
        !pointerInteracting.current &&
        !prefersReducedMotion
      ) {
        phiRef.current += 0.003;
      }
      const nextPhi = phiRef.current + rs.get();
      if (nextPhi !== lastPhi) {
        lastPhi = nextPhi;
        globe.update({ phi: nextPhi });
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    setTimeout(() => (canvasRef.current!.style.opacity = "1"), 0);
    return () => {
      cancelAnimationFrame(rafId);
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [config, isVisible, renderProfile, rs]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inset-0 mx-auto aspect-[1/1] h-[400px] w-[400px] md:h-[600px] md:w-[600px] lg:h-[800px] lg:w-[800px] 2xl:h-[1000px] 2xl:w-[1000px]",
        className,
      )}
    >
      <div className="orbit-ring" aria-hidden>
        <svg className="orbit-svg" viewBox="0 0 300 300">
          <defs>
            <path
              id={orbitPathId}
              d="M 150,150 m -130,0 a 130,130 0 1,0 260,0 a 130,130 0 1,0 -260,0"
            />
          </defs>
          <text className="orbit-text orbit-text--mobile">
            <textPath
              href={`#${orbitPathId}`}
              textLength="816"
              lengthAdjust="spacing"
            >
              {ORBIT_TEXT.repeat(ORBIT_TEXT_REPEAT_MOBILE)}
            </textPath>
          </text>
          <text className="orbit-text orbit-text--desktop">
            <textPath href={`#${orbitPathId}`}>
              {ORBIT_TEXT.repeat(ORBIT_TEXT_REPEAT_DESKTOP)}
            </textPath>
          </text>
        </svg>
      </div>
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
        )}
        ref={canvasRef}
        onPointerDown={(e) => {
          pointerInteracting.current = e.clientX;
          updatePointerInteraction(e.clientX);
        }}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
      <span
        className="seoul-pulse"
        style={
          {
            positionAnchor: "--cobe-seoul",
            opacity: "var(--cobe-visible-seoul, 0)",
          } as React.CSSProperties
        }
        aria-hidden
      >
        <span className="seoul-pulse__ring seoul-pulse__ring--late" />
      </span>
      {ALL_MARKERS.map((m) => (
        <div
          key={m.id}
          className="showcase-default-label"
          style={
            {
              positionAnchor: `--cobe-${m.id}`,
              opacity: `var(--cobe-visible-${m.id}, 0)`,
              filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
            } as React.CSSProperties
          }
        >
          {m.name}
        </div>
      ))}
    </div>
  );
}
