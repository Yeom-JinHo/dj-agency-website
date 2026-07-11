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
 * 헤더는 정적 정사각 커버(비닐랩 텍스처 없이 앨범 아트 그대로 — 카드가 "밀봉된
 * LP"라면 모달은 그 비닐을 벗겨 펼친 자리) + 캡션(artist) → lowercase 제목
 * → 설명 2줄 위계로 구성한다. 순백 포스터 절제 원칙에 따라 회전 애니메이션·
 * 그림자 이식 없이 카드 시각 어휘(질감·타이포)를 공유하되, 밀봉 텍스처만 벗긴다.
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
          className="absolute top-4 right-4 z-20 flex size-9 items-center justify-center text-[#111111]/55 transition-colors hover:text-[#111111] focus-visible:text-[#111111] focus-visible:outline-none"
        >
          <Icon name="LuClose" className="size-5" />
        </button>

        <div className="flex items-start gap-5 px-6 pt-8 pb-6 sm:gap-6 sm:px-8 sm:pt-10 sm:pb-8 lg:px-10">
          {/* 커버는 실제 앨범 아트를 그대로 노출한다. 카드(MusicCard)는 비닐랩
              텍스처로 "밀봉된 LP"를 연출하지만, 모달은 그 비닐을 벗겨 트랙을
              펼쳐 보는 자리 — 여기선 텍스처를 덮지 않는다. */}
          <div className="relative size-[96px] shrink-0 overflow-hidden outline outline-1 outline-[#111111]/10 sm:size-[128px] lg:size-[148px]">
            <Image
              src={track.cover}
              alt={track.name}
              fill
              sizes="148px"
              className="object-cover"
            />
          </div>

          <div className="min-w-0 flex-1 pr-8">
            {/* 모달은 세로 공간이 넉넉한 detail 뷰 — 콜라보 크레딧은 저작자 표시라
                clamp 없이 자연 줄바꿈으로 온전히 노출한다. tracking은 하단 링크 라벨
                (0.14em)과 통일해, 긴 이름이 넓은 자간으로 흩어져 보이던 문제를 줄인다. */}
            <p className="font-mono text-[11px] tracking-[0.14em] text-[#111111]/45 uppercase">
              {track.artist ?? "Juntaro"}
            </p>
            <h2
              id="track-modal-title"
              className="font-display line-clamp-2 pb-1 text-[clamp(1.95rem,4.5vw,3rem)] leading-[1.05] tracking-[0.01em] text-[#111111]"
            >
              {track.name}
            </h2>
            {track.shortDescription && (
              <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[#111111]/55">
                {track.shortDescription}
              </p>
            )}
          </div>
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
                    "group/row flex h-[52px] items-center gap-4 px-6 text-[#111111]",
                    "transition-colors duration-200 motion-reduce:transition-none",
                    "hover:bg-[var(--brand-bg)] hover:text-[var(--brand-text)]",
                    "focus-visible:bg-[var(--brand-bg)] focus-visible:text-[var(--brand-text)] focus-visible:outline-none",
                    "sm:h-[60px] sm:px-8 lg:h-[68px] lg:px-10",
                  )}
                >
                  <Icon name={link.iconName} className="size-5 shrink-0 sm:size-6" />
                  <span className="flex-1 font-mono text-sm tracking-[0.14em] uppercase sm:text-base">
                    {link.platform}
                  </span>
                  <Icon
                    name="LuArrowRight"
                    className={cn(
                      "size-4 shrink-0 opacity-40 sm:size-5",
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
