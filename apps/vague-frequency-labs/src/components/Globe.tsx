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
  showMarkers: boolean;
};

const DEFAULT_RENDER_PROFILE: GlobeRenderProfile = {
  devicePixelRatio: 1,
  mapSamples: DESKTOP_MAP_SAMPLES,
  showMarkers: true,
};

function getGlobeRenderProfile(
  viewportWidth: number,
  currentDevicePixelRatio: number,
): GlobeRenderProfile {
  const isMobile = viewportWidth < MOBILE_BREAKPOINT;
  return {
    devicePixelRatio: Math.min(
      currentDevicePixelRatio || 1,
      MAX_DEVICE_PIXEL_RATIO,
    ),
    mapSamples: isMobile
      ? MOBILE_MAP_SAMPLES
      : viewportWidth > LARGE_DESKTOP_BREAKPOINT
        ? LARGE_DESKTOP_MAP_SAMPLES
        : DESKTOP_MAP_SAMPLES,
    showMarkers: !isMobile,
  };
}

const SEOUL: [number, number] = [37.5665, 126.978];

type CityMarker = {
  id: string;
  name: string;
  location: [number, number];
  image: string;
  rotate: number;
};

const SEOUL_MARKER: CityMarker = {
  id: "seoul",
  name: "Seoul",
  location: SEOUL,
  image: "/images/logo/VFLABS.png",
  rotate: -4,
};

const FLIGHT_DESTINATIONS: CityMarker[] = [
  {
    id: "tokyo",
    name: "Tokyo",
    location: [35.6762, 139.6503],
    image: "/images/hero/1.jpg",
    rotate: -3,
  },
  {
    id: "bangkok",
    name: "Bangkok",
    location: [13.7563, 100.5018],
    image: "/images/hero/2.webp",
    rotate: 5,
  },
  {
    id: "sydney",
    name: "Sydney",
    location: [-33.8688, 151.2093],
    image: "/images/hero/3.jpg",
    rotate: 6,
  },
  {
    id: "paris",
    name: "Paris",
    location: [48.8566, 2.3522],
    image: "/images/hero/4.jpg",
    rotate: -6,
  },
  {
    id: "la",
    name: "Los Angeles",
    location: [34.0522, -118.2437],
    image: "/images/hero/5.webp",
    rotate: 4,
  },
];

const ALL_MARKERS: CityMarker[] = [SEOUL_MARKER, ...FLIGHT_DESTINATIONS];

// cobe `showcase: polaroids` 색·치수에 맞춘 globe config
const ACCENT: [number, number, number] = [0.4, 0.6, 0.9];
const MARKER_SIZE = 0.02;

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.2,
  dark: 0,
  diffuse: 1.5,
  mapSamples: DESKTOP_MAP_SAMPLES,
  mapBrightness: 9,
  baseColor: [1, 1, 1],
  markerColor: ACCENT,
  glowColor: [0.94, 0.93, 0.91],
  opacity: 0.9,
  markers: ALL_MARKERS.map(({ id, location }) => ({
    id,
    location,
    size: MARKER_SIZE,
  })),
  markerElevation: 0,
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
  const [mounted, setMounted] = useState(false);
  const [renderProfile, setRenderProfile] = useState<GlobeRenderProfile>(
    DEFAULT_RENDER_PROFILE,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

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
        currentRenderProfile.mapSamples === nextRenderProfile.mapSamples &&
        currentRenderProfile.showMarkers === nextRenderProfile.showMarkers
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
    if (!mounted || !isVisible || !canvasRef.current) {
      return;
    }

    const canvas = canvasRef.current;
    const { devicePixelRatio, mapSamples, showMarkers } = renderProfile;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    widthRef.current = canvas.offsetWidth;

    const globe = createGlobe(canvas, {
      ...config,
      devicePixelRatio,
      mapSamples,
      width: widthRef.current,
      height: widthRef.current,
      markers: showMarkers ? config.markers : [],
    });

    const onResize = () => {
      const next = canvas.offsetWidth;
      if (next === widthRef.current) {
        return;
      }
      widthRef.current = next;
      globe.update({ width: next, height: next });
    };
    window.addEventListener("resize", onResize);

    let rafId = 0;
    let lastPhi = Number.NaN;
    const tick = () => {
      if (document.hidden) {
        rafId = requestAnimationFrame(tick);
        return;
      }
      if (
        pointerInteracting.current === null &&
        !prefersReducedMotion
      ) {
        phiRef.current += 0.005;
      }
      const nextPhi = phiRef.current + rs.get();
      if (nextPhi !== lastPhi) {
        lastPhi = nextPhi;
        globe.update({ phi: nextPhi });
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const fadeInId = window.setTimeout(() => {
      if (canvasRef.current) {
        canvasRef.current.style.opacity = "1";
      }
    }, 0);
    return () => {
      clearTimeout(fadeInId);
      cancelAnimationFrame(rafId);
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [config, isVisible, mounted, renderProfile, rs]);

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
          <g className="orbit-rotor">
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
          </g>
        </svg>
      </div>
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
        )}
        ref={canvasRef}
        onPointerDown={(e) => updatePointerInteraction(e.clientX)}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
      {mounted && renderProfile.showMarkers && (
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
      )}
      {mounted &&
        renderProfile.showMarkers &&
        ALL_MARKERS.map((m) => (
          <div
            key={m.id}
            className="polaroid-marker"
            style={
              {
                positionAnchor: `--cobe-${m.id}`,
                opacity: `var(--cobe-visible-${m.id}, 0)`,
                filter: `blur(calc((1 - var(--cobe-visible-${m.id}, 0)) * 8px))`,
                ["--polaroid-rotate" as string]: `${m.rotate}deg`,
              } as React.CSSProperties
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="polaroid-marker__image"
              src={m.image}
              alt={m.name}
              width={60}
              height={60}
              loading="lazy"
              decoding="async"
            />
            <span className="polaroid-marker__caption">{m.name}</span>
          </div>
        ))}
    </div>
  );
}
