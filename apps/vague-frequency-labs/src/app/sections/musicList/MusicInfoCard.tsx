"use client";

import type { MusicInfo } from "@/types/music";
import type { ComponentType } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

interface MusicInfoProps {
  musicInfo: MusicInfo;
}

type MusicInfoCardDialogModule = typeof import("./MusicInfoCardDialog");
type MusicInfoCardDialogComponent = ComponentType<{
  defaultOpen?: boolean;
  musicInfo: MusicInfo;
  texture: string;
}>;

let musicInfoCardDialogPromise: Promise<MusicInfoCardDialogModule> | null = null;

function loadMusicInfoCardDialog() {
  if (!musicInfoCardDialogPromise) {
    musicInfoCardDialogPromise = import("./MusicInfoCardDialog").catch(
      (error) => {
        musicInfoCardDialogPromise = null;
        throw error;
      },
    );
  }

  return musicInfoCardDialogPromise;
}

function MusicInfoCard({ musicInfo }: MusicInfoProps) {
  const [DialogComponent, setDialogComponent] =
    useState<MusicInfoCardDialogComponent | null>(null);
  const [defaultOpen, setDefaultOpen] = useState(false);
  const texture = useMemo(() => {
    // musicInfo.name을 기반으로 결정적 랜덤 생성
    const hash = musicInfo.name.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const textureNumber = (Math.abs(hash) % 3) + 1;
    return `/images/texture/${textureNumber}.png`;
  }, [musicInfo.name]);

  const preloadDialog = useCallback(() => {
    void loadMusicInfoCardDialog().catch(() => {
      // Retry on the next interaction if the chunk load fails.
    });
  }, []);

  const activateDialog = useCallback(() => {
    void loadMusicInfoCardDialog()
      .then((module) => {
        setDialogComponent(() => module.default);
        setDefaultOpen(true);
      })
      .catch((error: unknown) => {
        setDefaultOpen(false);
        console.error("Failed to load MusicInfoCardDialog", error);
      });
  }, []);

  useEffect(() => {
    if (DialogComponent && defaultOpen) {
      setDefaultOpen(false);
    }
  }, [DialogComponent, defaultOpen]);

  if (DialogComponent) {
    return (
      <DialogComponent
        defaultOpen={defaultOpen}
        musicInfo={musicInfo}
        texture={texture}
      />
    );
  }

  return (
    <button
      type="button"
      aria-label={`Open ${musicInfo.name}`}
      className="group relative block h-[150px] w-[150px] overflow-hidden md:h-[360px] md:w-[360px]"
      onClick={activateDialog}
      onFocus={preloadDialog}
      onPointerEnter={preloadDialog}
      onTouchStart={preloadDialog}
    >
      <Image
        width={360}
        height={360}
        src={musicInfo.image}
        alt={musicInfo.name}
        sizes="(max-width: 768px) 150px, 360px"
        className="h-full w-full object-cover"
      />
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-500 hover:opacity-0"
        style={{ backgroundImage: `url("${texture}")` }}
      />
    </button>
  );
}

export default MusicInfoCard;
