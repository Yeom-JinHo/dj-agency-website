"use client";

import { useEffect, useRef } from "react";

import { cn } from "@repo/ui";

interface MouseEvent {
  movementY: number;
  clientX: number;
}

export default function FancyLine({
  className,
  borderColor,
}: {
  className?: string;
  borderColor?: string;
}) {
  const path = useRef<SVGPathElement>(null);

  let progress = 0;
  let x = 0.5;
  let time = Math.PI / 2;
  let reqId: number | null = null;

  useEffect(() => {
    try {
      setPath(progress);
    } catch (error) {
      console.warn("Line component setup error:", error);
    }
    // 마운트 시 초기 경로(progress = 0)만 1회 그린다. 이후 갱신은 마우스 핸들러가 담당.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setPath = (progress: number) => {
    try {
      const width = window.innerWidth * 1;

      path.current?.setAttributeNS(
        null,
        "d",
        `M0 250 Q${width * x} ${250 + progress}, ${width} 250`
      );
    } catch (error) {
      console.warn("Line path setting error:", error);
    }
  };

  const lerp = (x: number, y: number, a: number) => x * (1 - a) + y * a;

  const manageMouseEnter = () => {
    if (reqId) {
      cancelAnimationFrame(reqId);
      resetAnimation();
    }
  };

  const manageMouseMove = (e: MouseEvent) => {
    const { movementY, clientX } = e;

    const pathBound = path.current?.getBoundingClientRect();

    if (pathBound) {
      x = (clientX - pathBound.left) / pathBound.width;
      progress += movementY;
      setPath(progress);
    }
  };

  const manageMouseLeave = () => {
    animateOut();
  };

  const animateOut = () => {
    const newProgress = progress * Math.sin(time);
    progress = lerp(progress, 0, 0.025);
    time += 0.2;
    setPath(newProgress);

    if (Math.abs(progress) > 0.75) {
      reqId = requestAnimationFrame(animateOut);
    } else {
      resetAnimation();
    }
  };

  const resetAnimation = () => {
    time = Math.PI / 2;
    progress = 0;
  };

  return (
    <div className={cn("relative h-px w-full", className)}>
      <div
        onMouseEnter={() => {
          manageMouseEnter();
        }}
        onMouseMove={(e) => {
          manageMouseMove(e);
        }}
        onMouseLeave={() => {
          manageMouseLeave();
        }}
        className="relative top-[-40px] z-10 h-10 w-full"
      ></div>
      <svg className="absolute top-[-250px] h-[500px] w-full">
        <path
          ref={path}
          className={cn(
            "text-border fill-none stroke-current stroke-[1px]",
            borderColor
          )}
        ></path>
      </svg>
    </div>
  );
}
