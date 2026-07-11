"use client";

import type { JuntaroTrack } from "@/types/music";
import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence } from "motion/react";

import { cn } from "@repo/ui";

import { TrackModal } from "./TrackModal";
import { getTrackTexture } from "./texture";

interface MusicCardProps {
  track: JuntaroTrack;
  /** collage 카드(정사각형) 크기·그림자 클래스. VFL collage variant 미러 — 유일 소비자인 콜라주 레이아웃에서 항상 전달한다. */
  cardClassName?: string;
  /** 초기 뷰포트에 보이는 카드에만 true — LCP 이미지 우선 로드. 나머지는 기본 lazy. */
  priority?: boolean;
}

/**
 * 비닐랩 커버 타일. VFL MusicInfoCard의 카드 파트(텍스처 결정·컨테이너·비닐랩 오버레이)를
 * 시각 동일 이식하되, 라벨은 VFL collage variant처럼 hover 시 하단 그라데이션 오버레이로
 * 노출한다. 클릭 시 Strobe Row 링크 허브 모달(TrackModal)을 카드별 로컬 상태로 소유한다.
 */
export function MusicCard({ track, cardClassName, priority = false }: MusicCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const handleClose = useCallback(() => setIsOpen(false), []);

  const texture = useMemo(() => getTrackTexture(track.name), [track.name]);

  return (
    <div>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={`${track.name} 트랙 정보 열기`}
        className="block w-full cursor-pointer bg-transparent p-0 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#111111]"
      >
        {/* bg-neutral-200: 커버 디코드 전 카드 형태를 즉시 확보하는 스켈레톤 톤.
            텍스처(opacity-70 비닐랩) 너머로 비치는 at-rest 밝은 회색에 맞춰 팝인/공백
            플래시를 없앤다. */}
        <div
          className={cn(
            "group relative overflow-hidden bg-neutral-200",
            cardClassName,
          )}
        >
          <Image
            width={400}
            height={400}
            src={track.cover}
            alt={track.name}
            priority={priority}
            sizes="(max-width: 767px) 150px, (max-width: 1023px) 240px, (max-width: 1279px) 300px, (max-width: 1535px) 360px, 400px"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
          />
          <Image
            src={texture}
            alt=""
            aria-hidden="true"
            fill
            // 커버와 동일한 priority — 평상시 커버 위에 비치는 비닐랩 레이어라
            // 함께 우선 로드해야 초기 카드가 반쪽(커버만)으로 보이지 않는다.
            priority={priority}
            sizes="(max-width: 767px) 150px, (max-width: 1023px) 240px, (max-width: 1279px) 300px, (max-width: 1535px) 360px, 400px"
            className="pointer-events-none object-cover opacity-70 transition-opacity duration-500 group-hover:opacity-0 motion-reduce:transition-none"
          />
          {/* 콜라주 라벨 — hover 시에만 카드 하단 오버레이로 노출 (VFL collage variant 미러) */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-2.5 pt-10 text-left opacity-0 transition-opacity duration-300 group-hover:opacity-100 motion-reduce:transition-none">
            <h4 className="font-display truncate text-base leading-[1.05] tracking-[0.02em] text-white">
              {track.name}
            </h4>
            {track.artist && (
              /* truncate + title: hover 라벨은 순간적 글랜스 상태라 1줄로 잘라 스캔성을
                 유지한다. 전체 콜라보 크레딧은 한 클릭 거리의 모달에서 온전히 노출되고,
                 데스크톱은 title 네이티브 툴팁으로 잘린 이름을 보완한다. */
              <p className="truncate text-xs text-neutral-300" title={track.artist}>
                {track.artist}
              </p>
            )}
          </div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <TrackModal track={track} onClose={handleClose} triggerRef={triggerRef} />
        )}
      </AnimatePresence>
    </div>
  );
}
