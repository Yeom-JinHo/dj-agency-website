"use client";

import type { CSSProperties, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@repo/ui";
import { Icon } from "@repo/ui/common/Icon";
import type { IconName } from "@repo/ui/common/Icon";

import type { JuntaroTrack } from "@/types/music";
import useClickOutside from "@/hooks/useClickOutside";

interface TrackModalProps {
  track: JuntaroTrack;
  onClose: () => void;
  triggerRef: RefObject<HTMLButtonElement | null>;
}

// hover/focus 시 행 전체를 침수시키는 플랫폼 브랜드 컬러.
// Apple의 실제 브랜드 컬러(흰색)는 순백 패널 위에서 보이지 않아 잉크(#111)로 대체한다.
const BRAND_FLOOD: Partial<Record<IconName, { bg: string; text: string }>> = {
  SiYoutube: { bg: "#ff0000", text: "#ffffff" },
  SiSoundcloud: { bg: "#ff5500", text: "#ffffff" },
  SiSpotify: { bg: "#1ed760", text: "#111111" },
  SiApple: { bg: "#111111", text: "#ffffff" },
  SiBeatport: { bg: "#a8ff04", text: "#111111" },
};
const DEFAULT_FLOOD = { bg: "#111111", text: "#ffffff" };

/**
 * Strobe Row 링크 허브 모달 — 컨테인드 버전.
 * 회전 LP 디스크(광택·바이닐 캡 28%·그루브·스핀들 10%·5s linear 회전)는
 * VFL MusicInfoCard.tsx:118–170과 시각 동일 이식, 필드만 치환. 크기만 패널
 * 우상단 위성(소형)으로 축소하고, 다크 모달 전제였던 ring-white/5는 순백
 * 배경에서 무의미해 생략했다 — 그 외 렌더링(그라디언트 값·구조)은 그대로.
 *
 * a11y(스크롤 락·포커스 트랩·포커스 복귀·Escape·외부 클릭 닫기)는
 * VFL MorphingDialog.tsx:213–283 로직을 그대로 이식했다. 다만 원본은 상시
 * 마운트된 컴포넌트가 isOpen 불리언으로 분기하는 구조였고, 이 컴포넌트는
 * open일 때만 마운트되는 구조라 "isOpen true" 분기는 마운트 이펙트로,
 * "isOpen false" 분기는 그 클린업 함수로 자연스럽게 대응시켰다.
 */
export function TrackModal({ track, onClose, triggerRef }: TrackModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const hasLinks = track.links.length > 0;

  const [firstFocusableElement, setFirstFocusableElement] =
    useState<HTMLElement | null>(null);
  const [lastFocusableElement, setLastFocusableElement] =
    useState<HTMLElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key === "Tab") {
        if (!firstFocusableElement || !lastFocusableElement) return;

        if (event.shiftKey) {
          if (document.activeElement === firstFocusableElement) {
            event.preventDefault();
            lastFocusableElement.focus();
          }
        } else {
          if (document.activeElement === lastFocusableElement) {
            event.preventDefault();
            firstFocusableElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, firstFocusableElement, lastFocusableElement]);

  useEffect(() => {
    document.body.classList.add("overflow-hidden");

    const focusableElements = containerRef.current?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements && focusableElements.length > 0) {
      const first = focusableElements[0] ?? null;
      const last = focusableElements[focusableElements.length - 1] ?? null;
      setFirstFocusableElement(first);
      setLastFocusableElement(last);
      first?.focus();
    } else if (containerRef.current) {
      setFirstFocusableElement(containerRef.current);
      setLastFocusableElement(containerRef.current);
      containerRef.current.focus();
    }

    const triggerElement = triggerRef.current;

    return () => {
      document.body.classList.remove("overflow-hidden");
      triggerElement?.focus();
    };
  }, [triggerRef]);

  useClickOutside(containerRef, onClose);

  const artistLine = track.artist ?? "Juntaro";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
      <motion.div
        aria-hidden="true"
        className="absolute inset-0 bg-[#111111]/[0.42] backdrop-blur-[2px]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: shouldReduceMotion ? 0.01 : 0.28 }}
      />

      <motion.div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="track-modal-title"
        tabIndex={-1}
        className="relative z-10 max-h-[calc(100dvh-2rem)] w-full max-w-[800px] overflow-x-hidden overflow-y-auto rounded-[2px] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35)] outline-none sm:max-h-[calc(100dvh-4rem)]"
        initial={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.96, y: 16 }
        }
        animate={
          shouldReduceMotion ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }
        }
        exit={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.96, y: 16 }
        }
        transition={
          shouldReduceMotion
            ? { duration: 0.01 }
            : { duration: 0.32, ease: [0.16, 1, 0.3, 1] }
        }
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="absolute top-4 left-4 z-20 flex size-9 items-center justify-center text-[#111111]/55 transition-colors hover:text-[#111111] focus-visible:text-[#111111] focus-visible:outline-none"
        >
          <Icon name="LuClose" className="size-5" />
        </button>

        <div className="flex items-start justify-between gap-4 px-6 pt-16 pb-6 sm:px-8 sm:pt-16 sm:pb-8 lg:px-10">
          <div className="min-w-0 flex-1">
            <h2
              id="track-modal-title"
              className="line-clamp-2 text-[clamp(2.5rem,6vw,4.5rem)] leading-[0.95] font-bold tracking-tight text-[#111111] lowercase"
            >
              {track.name}
            </h2>
            <p className="mt-3 truncate font-mono text-xs tracking-[0.08em] text-[#111111]/55 sm:text-sm">
              {artistLine}
            </p>
            {track.shortDescription && (
              <p className="mt-1 font-mono text-xs tracking-[0.08em] text-[#111111]/40 sm:text-sm">
                {track.shortDescription}
              </p>
            )}
          </div>

          <motion.div
            className="relative aspect-square size-[92px] shrink-0 overflow-hidden rounded-full shadow-[0_12px_44px_rgba(0,0,0,0.6)] sm:size-[120px] lg:size-[150px]"
            initial={{ scale: 0.92, opacity: 0, rotate: 0 }}
            animate={
              shouldReduceMotion
                ? { scale: 1, opacity: 1, rotate: 0 }
                : { scale: 1, opacity: 1, rotate: 360 }
            }
            transition={
              shouldReduceMotion
                ? { duration: 0.01 }
                : {
                    scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.4 },
                    rotate: {
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear",
                      delay: 0.45,
                    },
                  }
            }
          >
            <Image
              src={track.cover}
              alt={track.name}
              fill
              sizes="150px"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(125deg, rgba(255,255,255,0.14), transparent 42%)",
              }}
            />
            <div
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 aspect-square w-[28%] -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-black/50"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, #1b1b1d 0%, #101011 55%, #0a0a0b 100%)",
              }}
            >
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "repeating-radial-gradient(circle at 50% 50%, rgba(236,234,227,0.06) 0px, rgba(236,234,227,0.06) 1px, transparent 1px, transparent 3px)",
                }}
              />
              <div className="absolute top-1/2 left-1/2 size-[10%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0a0a0b] ring-1 ring-white/25" />
            </div>
          </motion.div>
        </div>

        {hasLinks && (
          <div className="divide-y divide-[#111111]/12 border-t border-[#111111]/12">
            {track.links.map((link) => {
              const flood = BRAND_FLOOD[link.iconName] ?? DEFAULT_FLOOD;
              return (
                <a
                  key={link.platform}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={
                    {
                      "--brand-bg": flood.bg,
                      "--brand-text": flood.text,
                    } as CSSProperties
                  }
                  className={cn(
                    "group/row flex h-16 items-center gap-4 px-6 text-[#111111]",
                    "transition-colors duration-200 motion-reduce:transition-none",
                    "hover:bg-[var(--brand-bg)] hover:text-[var(--brand-text)]",
                    "focus-visible:bg-[var(--brand-bg)] focus-visible:text-[var(--brand-text)] focus-visible:outline-none",
                    "sm:h-20 sm:px-8 lg:h-[88px] lg:px-10",
                  )}
                >
                  <Icon name={link.iconName} className="size-6 shrink-0 sm:size-7" />
                  <span className="flex-1 font-mono text-sm tracking-[0.14em] uppercase sm:text-base">
                    {link.platform}
                  </span>
                  <Icon
                    name="LuArrowRight"
                    className={cn(
                      "size-5 shrink-0 opacity-40",
                      "transition-[transform,opacity] duration-200 motion-reduce:transition-none",
                      "group-hover/row:translate-x-1 group-hover/row:opacity-100",
                      "group-focus-visible/row:translate-x-1 group-focus-visible/row:opacity-100",
                    )}
                  />
                </a>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>,
    document.body,
  );
}
