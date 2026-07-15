"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { IconDeviceMobileRotated } from "@tabler/icons-react";
import AtroposCore from "atropos";

import "atropos/css";

import useDeviceTilt from "../hooks/useDeviceTilt";

export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);

  // 모바일 자이로 틸트(데스크톱 atropos와 상호배타). "idle"일 때만 힌트 노출.
  const tiltPermission = useDeviceTilt(rootRef);

  // SSR/첫 페인트에는 힌트를 렌더하지 않는다. 초기 state가 전 기기 공통 "idle"이라,
  // 마운트 전에 그리면 데스크톱에서 힌트가 1프레임 반짝였다 사라진다(effect가
  // "unsupported"로 바꾸기 전). mount 후에만 노출해 이 플래시를 원천 차단.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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

      <AnimatePresence>
        {mounted && tiltPermission === "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="pointer-events-none absolute inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] flex justify-center"
          >
            {/* 힌트는 pill 형태로 명시적 인터랙션처럼 읽히되, 탭은 hero 전체가
                받으므로(pointer-events-none) 눌러도 그대로 통과한다. 은은한 scale
                pulse로 시선을 유도해 발견성을 높인다. */}
            <motion.span
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              className="inline-flex items-center gap-2 rounded-full border border-[#111111]/20 bg-white/50 px-4 py-2 font-mono text-[10px] tracking-[0.25em] text-[#111111]/60 uppercase backdrop-blur-sm"
            >
              <IconDeviceMobileRotated size={14} stroke={1.5} aria-hidden />
              Tap to feel it
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
