"use client";

import type { COBEOptions } from "cobe";
import { useEffect, useRef } from "react";
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

const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples:
    typeof window !== "undefined" && window.innerWidth > 1920 ? 15000 : 10000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [251 / 255, 100 / 255, 21 / 255],
  glowColor: [1, 1, 1],
  markers: [
    { location: [37.5665, 126.978], size: 0.1 }, // 서울
    { location: [35.1796, 129.0756], size: 0.08 }, // 부산
    { location: [35.8714, 128.6014], size: 0.07 }, // 대구
    { location: [37.4563, 126.7052], size: 0.07 }, // 인천
    { location: [13.7563, 100.5018], size: 0.07 }, // 방콕
  ],
};

export default function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  config?: COBEOptions;
}) {
  let phi = 0;
  let width = 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);

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
      pointerInteractionMovement.current = delta;
      r.set(r.get() + delta / MOVEMENT_DAMPING);
    }
  };

  useEffect(() => {
    const viewportWidth = window.innerWidth;
    const devicePixelRatio =
      viewportWidth < MOBILE_BREAKPOINT
        ? 1
        : Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
    const mapSamples =
      viewportWidth < MOBILE_BREAKPOINT
        ? MOBILE_MAP_SAMPLES
        : viewportWidth > LARGE_DESKTOP_BREAKPOINT
          ? LARGE_DESKTOP_MAP_SAMPLES
          : DESKTOP_MAP_SAMPLES;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const onResize = () => {
      if (canvasRef.current) {
        width = canvasRef.current.offsetWidth;
      }
    };

    window.addEventListener("resize", onResize);
    onResize();

    const globe = createGlobe(canvasRef.current!, {
      ...config,
      devicePixelRatio,
      mapSamples,
      width: width * devicePixelRatio,
      height: width * devicePixelRatio,
      onRender: (state) => {
        if (
          !pointerInteracting.current &&
          !document.hidden &&
          !prefersReducedMotion
        ) {
          phi += 0.005;
        }
        state.phi = phi + rs.get();
        state.width = width * devicePixelRatio;
        state.height = width * devicePixelRatio;
      },
    });

    setTimeout(() => (canvasRef.current!.style.opacity = "1"), 0);
    return () => {
      globe.destroy();
      window.removeEventListener("resize", onResize);
    };
  }, [rs, config]);

  return (
    <div
      className={cn(
        "inset-0 mx-auto aspect-[1/1] h-[400px] w-[400px] md:h-[600px] md:w-[600px] lg:h-[800px] lg:w-[800px] 2xl:h-[1000px] 2xl:w-[1000px]",
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
    </div>
  );
}
