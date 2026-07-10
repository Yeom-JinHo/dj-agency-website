"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import AtroposCore from "atropos";

import "atropos/css";

export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const canTilt =
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canTilt) return;

    const instance = AtroposCore({
      el,
      rotateXMax: 9,
      rotateYMax: 9,
      activeOffset: 40,
      shadow: false,
      highlight: false,
      rotateTouch: false,
    });

    return () => {
      instance.destroy();
    };
  }, []);

  return (
    <section className="relative h-dvh overflow-hidden bg-white select-none">
      <div ref={rootRef} className="atropos h-full w-full">
        <span className="atropos-scale">
          <span className="atropos-rotate">
            <span className="atropos-inner bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element -- 장식용 블러 에코, 이미지 최적화 불필요 */}
              <img
                src="/images/logo.webp"
                alt=""
                aria-hidden
                data-atropos-offset="0"
                className="absolute top-[42%] left-1/2 w-[min(82vw,110dvh)] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.07] blur-[7px] invert"
              />
              <Image
                src="/images/profile.webp"
                alt="Juntaro"
                width={1186}
                height={1766}
                priority
                sizes="min(54vh, 92vw)"
                data-atropos-offset="2"
                className="absolute top-1/2 left-1/2 h-[min(66dvh,120vw)] w-auto -translate-x-1/2 -translate-y-1/2 mix-blend-multiply"
              />
              <Image
                src="/images/logo.webp"
                alt=""
                aria-hidden
                width={400}
                height={300}
                data-atropos-offset="6"
                className="absolute bottom-[19dvh] left-1/2 w-[min(44vw,31dvh)] -translate-x-1/2 invert md:bottom-[14dvh]"
              />
            </span>
          </span>
        </span>
      </div>
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[11px] tracking-[0.3em] text-[#111111] uppercase">
        Tech House — Seoul
      </p>
    </section>
  );
}
