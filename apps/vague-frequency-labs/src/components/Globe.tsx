"use client";

import type { COBEOptions } from "cobe";
import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import { useMotionValue, useSpring } from "motion/react";

import { cn } from "@repo/ui";

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
    devicePixelRatio:
      viewportWidth < MOBILE_BREAKPOINT
        ? 1
        : Math.min(currentDevicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO),
    mapSamples:
      viewportWidth < MOBILE_BREAKPOINT
        ? MOBILE_MAP_SAMPLES
        : viewportWidth > LARGE_DESKTOP_BREAKPOINT
          ? LARGE_DESKTOP_MAP_SAMPLES
          : DESKTOP_MAP_SAMPLES,
  };
}

const SEOUL: [number, number] = [37.5665, 126.978];

function haversine(
  [lat1, lon1]: [number, number],
  [lat2, lon2]: [number, number],
) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * Math.asin(Math.sqrt(a));
}

type FlightDestination = {
  id: string;
  name: string;
  location: [number, number];
  size: number;
};

// 서울에서 가까운 순으로 정렬해 wave가 안에서 밖으로 발산되도록 한다.
const FLIGHT_DESTINATIONS: FlightDestination[] = (
  [
    { id: "tokyo", name: "Tokyo", location: [35.6762, 139.6503], size: 0.02 },
    { id: "beijing", name: "Beijing", location: [39.9042, 116.4074], size: 0.02 },
    { id: "bangkok", name: "Bangkok", location: [13.7563, 100.5018], size: 0.018 },
    { id: "singapore", name: "Singapore", location: [1.3521, 103.8198], size: 0.018 },
    { id: "sydney", name: "Sydney", location: [-33.8688, 151.2093], size: 0.02 },
    { id: "dubai", name: "Dubai", location: [25.2048, 55.2708], size: 0.018 },
    { id: "london", name: "London", location: [51.5074, -0.1278], size: 0.02 },
    { id: "paris", name: "Paris", location: [48.8566, 2.3522], size: 0.018 },
    { id: "newyork", name: "New York", location: [40.7128, -74.006], size: 0.022 },
    { id: "la", name: "Los Angeles", location: [34.0522, -118.2437], size: 0.02 },
    { id: "saopaulo", name: "São Paulo", location: [-23.5505, -46.6333], size: 0.02 },
  ] satisfies FlightDestination[]
).sort((a, b) => haversine(SEOUL, a.location) - haversine(SEOUL, b.location));

const ACCENT: [number, number, number] = [0.32, 0.5, 0.88]; // 모던 블루

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.55,
  mapSamples:
    typeof window !== "undefined" && window.innerWidth > 1920 ? 15000 : 10000,
  mapBrightness: 1.3,
  baseColor: [1, 1, 1],
  markerColor: ACCENT,
  glowColor: [0.78, 0.86, 0.97],
  markers: [
    { id: "seoul", location: SEOUL, size: 0 }, // 서울 (CSS 펄스로 대체)
    ...FLIGHT_DESTINATIONS.map(({ id, location, size }) => ({
      id,
      location,
      size,
    })),
  ],
  arcs: FLIGHT_DESTINATIONS.map(({ location }) => ({
    from: SEOUL,
    to: location,
  })),
  arcColor: ACCENT,
  arcWidth: 0.4,
  arcHeight: 0.3,
  markerElevation: 0.005,
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

    const onResize = () => {
      widthRef.current = canvasRef.current?.offsetWidth ?? 0;
    };

    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current, {
      ...config,
      devicePixelRatio,
      mapSamples,
      width: widthRef.current * devicePixelRatio,
      height: widthRef.current * devicePixelRatio,
    });

    let rafId = 0;
    const tick = () => {
      if (
        !pointerInteracting.current &&
        !document.hidden &&
        !prefersReducedMotion
      ) {
        phiRef.current += 0.005;
      }
      globe.update({
        phi: phiRef.current + rs.get(),
        width: widthRef.current * devicePixelRatio,
        height: widthRef.current * devicePixelRatio,
      });
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
        "globe-pulse relative inset-0 mx-auto aspect-[1/1] h-[400px] w-[400px] md:h-[600px] md:w-[600px] lg:h-[800px] lg:w-[800px] 2xl:h-[1000px] 2xl:w-[1000px]",
        className,
      )}
    >
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
      <span
        className="city-label city-label--seoul"
        style={
          {
            positionAnchor: "--cobe-seoul",
            opacity: "var(--cobe-visible-seoul, 0)",
          } as React.CSSProperties
        }
      >
        Seoul
      </span>
      {FLIGHT_DESTINATIONS.map((d) => (
        <span
          key={d.id}
          className="city-label"
          style={
            {
              positionAnchor: `--cobe-${d.id}`,
              opacity: `var(--cobe-visible-${d.id}, 0)`,
            } as React.CSSProperties
          }
        >
          {d.name}
        </span>
      ))}
      <svg className="globe-band" viewBox="0 0 100 100" aria-hidden>
        <defs>
          <path
            id="globe-equator"
            d="M 5,50 A 45,13 0 1,1 95,50 A 45,13 0 1,1 5,50"
            fill="none"
          />
        </defs>
        <text className="globe-band__text">
          <textPath href="#globe-equator" startOffset="0%">
            VAGUE · FREQUENCY · LABS · EST · 2025 · VAGUE · FREQUENCY · LABS · EST · 2025 ·
            <animate
              attributeName="startOffset"
              from="0%"
              to="100%"
              dur="40s"
              repeatCount="indefinite"
            />
          </textPath>
        </text>
      </svg>
    </div>
  );
}
