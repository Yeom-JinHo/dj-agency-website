"use client";

import type { JuntaroTrack } from "@/types/music";
import { useMemo } from "react";
import Image from "next/image";

import { cn } from "@repo/ui";

interface MusicCardProps {
  track: JuntaroTrack;
}

/**
 * 정적 커버 타일. VFL MusicInfoCard의 카드 파트(텍스처 결정·컨테이너·비닐랩 오버레이)를
 * 시각 동일 이식하되, 모달/onClick은 M4에서 도입한다(현재는 순수 타일).
 */
export function MusicCard({ track }: MusicCardProps) {
  const texture = useMemo(() => {
    // track.name을 기반으로 결정적 랜덤 생성
    const hash = track.name.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const textureNumber = (Math.abs(hash) % 3) + 1;
    return `/images/texture/${textureNumber}.webp`;
  }, [track.name]);

  return (
    <div>
      <div
        className={cn(
          "group relative overflow-hidden",
          "h-[150px] w-[150px] md:h-[240px] md:w-[240px] lg:h-[300px] lg:w-[300px] xl:h-[360px] xl:w-[360px] 2xl:h-[400px] 2xl:w-[400px]",
        )}
      >
        <Image
          width={400}
          height={400}
          src={track.cover}
          alt={track.name}
          sizes="(max-width: 767px) 150px, (max-width: 1023px) 240px, (max-width: 1279px) 300px, (max-width: 1535px) 360px, 400px"
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none"
        />
        <Image
          src={texture}
          alt=""
          aria-hidden="true"
          fill
          sizes="(max-width: 767px) 150px, (max-width: 1023px) 240px, (max-width: 1279px) 300px, (max-width: 1535px) 360px, 400px"
          className="pointer-events-none object-cover transition-opacity duration-500 group-hover:opacity-0 motion-reduce:transition-none"
        />
      </div>
      <div className="mt-3 w-[150px] text-left md:w-[240px] lg:w-[300px] xl:w-[360px] 2xl:w-[400px]">
        <h4 className="truncate text-sm font-semibold text-[#111111] md:text-base">
          {track.name}
        </h4>
        {track.artist && (
          <p className="truncate font-mono text-xs tracking-[0.08em] text-[#111111]/55 md:text-sm">
            {track.artist}
          </p>
        )}
      </div>
    </div>
  );
}
