"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValueEvent } from "motion/react";

type Status = "loading" | "ready" | "missing";

type Props = {
  frameCount: number;
  framePath: string;
  framePrefix?: string;
  frameExt?: string;
  framePadding?: number;
  bgColor: string;
};

const frameSrcFor = (
  i: number,
  framePath: string,
  framePrefix: string,
  frameExt: string,
  framePadding: number,
) => `${framePath}${framePrefix}${String(i + 1).padStart(framePadding, "0")}.${frameExt}`;

function paintFrame(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement | undefined,
  bgColor: string,
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const cw = canvas.width;
  const ch = canvas.height;
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, cw, ch);

  if (!img || !img.complete || img.naturalWidth === 0) return;

  const ir = img.naturalWidth / img.naturalHeight;
  const cr = cw / ch;
  let dw: number, dh: number, dx: number, dy: number;
  if (ir > cr) {
    dh = ch;
    dw = ch * ir;
    dx = (cw - dw) / 2;
    dy = 0;
  } else {
    dw = cw;
    dh = cw / ir;
    dx = 0;
    dy = (ch - dh) / 2;
  }
  ctx.drawImage(img, dx, dy, dw, dh);
}

export function ScrollScene({
  frameCount,
  framePath,
  framePrefix = "",
  frameExt = "webp",
  framePadding = 4,
  bgColor,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const currentFrameRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const reducedMotionRef = useRef(false);

  const [status, setStatus] = useState<Status>("loading");
  const [loadedRatio, setLoadedRatio] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const titleOpacity = useTransform(scrollYProgress, [0.05, 0.15, 0.25, 0.35], [0, 1, 1, 0]);
  const titleY = useTransform(scrollYProgress, [0.05, 0.35], [40, -40]);
  const subOpacity = useTransform(scrollYProgress, [0.45, 0.55, 0.7, 0.8], [0, 1, 1, 0]);
  const subY = useTransform(scrollYProgress, [0.45, 0.8], [40, -40]);
  const tailOpacity = useTransform(scrollYProgress, [0.85, 0.95], [0, 1]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
      reducedMotionRef.current = mq.matches;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const imgs: HTMLImageElement[] = [];
    let settled = 0;
    let errored = 0;

    const onSettled = () => {
      settled++;
      if (!cancelled) setLoadedRatio(settled / frameCount);
      if (settled === frameCount && !cancelled) {
        setStatus(errored === frameCount ? "missing" : "ready");
        const canvas = canvasRef.current;
        if (canvas) paintFrame(canvas, imgs[0], bgColor);
      }
    };

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.decoding = "async";
      img.onload = onSettled;
      img.onerror = () => {
        errored++;
        onSettled();
      };
      img.src = frameSrcFor(i, framePath, framePrefix, frameExt, framePadding);
      imgs.push(img);
    }
    imagesRef.current = imgs;

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [frameCount, framePath, framePrefix, frameExt, framePadding, bgColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const setSize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      paintFrame(canvas, imagesRef.current[currentFrameRef.current], bgColor);
    };
    setSize();
    const ro = new ResizeObserver(setSize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [bgColor]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reducedMotionRef.current) return;
    if (status !== "ready") return;
    const target = Math.min(frameCount - 1, Math.max(0, Math.round(v * (frameCount - 1))));
    if (target === currentFrameRef.current) return;
    currentFrameRef.current = target;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (canvas) paintFrame(canvas, imagesRef.current[target], bgColor);
    });
  });

  return (
    <section ref={containerRef} className="relative h-[500vh]">
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <canvas
          ref={canvasRef}
          className="block h-full w-full"
          role="img"
          aria-label="SonicWave Pro disassembly sequence"
        />

        {status === "loading" && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">
              Loading sequence
            </span>
            <span className="block h-px w-40 overflow-hidden bg-white/10">
              <span
                className="block h-full bg-white/60 transition-[width] duration-200 ease-out"
                style={{ width: `${Math.round(loadedRatio * 100)}%` }}
              />
            </span>
          </div>
        )}

        {status === "missing" && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">
              Frames missing
            </span>
            <p className="max-w-md text-sm text-white/60">
              Expected{" "}
              <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-white/80">
                public{framePath}
                {framePrefix}NNN.{frameExt}
              </code>
            </p>
          </div>
        )}

        <motion.div
          style={{ opacity: titleOpacity, y: titleY }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
        >
          <h2 className="text-center text-5xl font-medium tracking-tight text-white/90 md:text-7xl">
            Sound Redefined
          </h2>
        </motion.div>

        <motion.div
          style={{ opacity: subOpacity, y: subY }}
          className="pointer-events-none absolute inset-0 flex items-end justify-center px-6 pb-24"
        >
          <p className="max-w-md text-center text-sm text-white/60 md:text-base">
            A 40&nbsp;mm beryllium driver and a magnesium chassis lighter than your phone.
          </p>
        </motion.div>

        <motion.div
          style={{ opacity: tailOpacity }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
        >
          <p className="text-center text-[10px] uppercase tracking-[0.4em] text-white/40">
            Engineered to disappear
          </p>
        </motion.div>
      </div>
    </section>
  );
}
