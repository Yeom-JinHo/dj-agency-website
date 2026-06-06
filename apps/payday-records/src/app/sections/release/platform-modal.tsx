"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import Image from "next/image";
import { IconArrowUpRight, IconX } from "@tabler/icons-react";
import { motion } from "motion/react";

import type { Release } from "@/types/release";
import { PLATFORM_META, PLATFORM_ORDER } from "./platform-meta";

type PlatformModalProps = {
  release: Release;
  onClose: () => void;
};

function PlatformModal({ release, onClose }: PlatformModalProps) {
  const availablePlatforms = PLATFORM_ORDER.filter((p) => release.links[p]);
  const panelRef = useRef<HTMLDivElement>(null);

  // On open: move focus into the panel; on close: restore it to the element
  // that opened the modal. (Esc-to-close lives in the parent Release section.)
  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    panelRef.current?.querySelector<HTMLElement>("a[href], button")?.focus();
    return () => trigger?.focus?.();
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-[6vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      role="dialog"
      aria-modal="true"
      aria-label={`${release.title} 플랫폼 선택`}
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
      />

      <motion.div
        ref={panelRef}
        className="relative z-10 w-full max-w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-2xl"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
      >
        <div className="flex max-h-[88vh] flex-col overflow-y-auto">
          <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden bg-[#1a1a1a]">
            {release.artwork ? (
              <Image
                src={release.artwork}
                alt={release.title}
                fill
                sizes="360px"
                className="object-cover"
              />
            ) : (
              <div className="relative flex h-full w-full items-center justify-center">
                <span className="bg-pd-accent absolute top-0 left-0 h-full w-1" />
                <span className="line-clamp-3 max-w-[80%] text-center text-2xl font-semibold tracking-tight text-white/85">
                  {release.title}
                </span>
              </div>
            )}

            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="absolute top-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white/90 backdrop-blur-md transition-colors hover:bg-black/65 hover:text-white"
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5 text-left">
            <h3 className="truncate text-base font-semibold text-white md:text-lg">
              {release.title}
            </h3>
            <p className="mt-0.5 truncate text-sm text-white/60">
              {release.artist}
            </p>
            {(release.label || release.catalogNo) && (
              <p className="mt-1.5 truncate font-mono text-[10px] tracking-widest text-white/35 uppercase">
                {[release.label, release.catalogNo]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>

          <div className="h-px w-full bg-white/[0.08]" />

          <ul className="py-1">
            {availablePlatforms.map((platform) => {
              const { label, brand, Icon } = PLATFORM_META[platform];
              return (
                <li key={platform}>
                  <a
                    href={release.links[platform]}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ "--brand": brand } as CSSProperties}
                    className="group/row flex h-14 items-center gap-4 px-5 transition-colors hover:bg-white/[0.06]"
                  >
                    <Icon className="h-6 w-6 text-white/90 transition-colors duration-200 group-hover/row:text-[var(--brand)]" />
                    <span className="flex-1 text-sm font-medium text-white/90">
                      {label}
                    </span>
                    <IconArrowUpRight className="h-4 w-4 text-white/35 transition-colors group-hover/row:text-white/80" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default PlatformModal;
