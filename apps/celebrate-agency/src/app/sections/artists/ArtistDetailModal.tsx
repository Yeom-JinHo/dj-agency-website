"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

import { Icon, type IconName } from "@repo/ui/common/Icon";

import type { Artist, ArtistSocialPlatform } from "@/types/artist";

const PLATFORM_ICON: Record<ArtistSocialPlatform, IconName | null> = {
  instagram: "SiInstagram",
  spotify: "SiSpotify",
  youtube: "SiYoutube",
  x: "SiX",
  soundcloud: "SiSoundcloud",
  etc: null,
};

interface ArtistDetailModalProps {
  artist: Artist | null;
  onClose: () => void;
}

export function ArtistDetailModal({
  artist,
  onClose,
}: ArtistDetailModalProps) {
  useEffect(() => {
    if (!artist) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [artist, onClose]);

  return (
    <AnimatePresence>
      {artist && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6 backdrop-blur-sm sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={artist.name}
            className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-neutral-900 text-white shadow-2xl"
            initial={{ scale: 0.92, opacity: 0, y: 8 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 4 }}
            transition={{ type: "spring", stiffness: 320, damping: 28, mass: 0.7 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative aspect-[3/4]">
              <Image
                src={artist.image}
                alt={artist.name}
                fill
                sizes="(max-width: 768px) 100vw, 480px"
                className="object-cover object-top"
                unoptimized
              />
            </div>
            <div className="space-y-3 p-5">
              <h2 className="text-xl font-semibold">{artist.name}</h2>
              <p className="text-sm leading-relaxed text-neutral-300">
                {artist.bio}
              </p>
              {artist.socials.length > 0 && (
                <ul className="flex flex-wrap gap-2 pt-2">
                  {artist.socials.map((s) => {
                    const iconName = PLATFORM_ICON[s.platform];
                    return (
                      <li key={`${s.platform}-${s.url}`}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={s.label ?? s.platform}
                          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:bg-white/10"
                        >
                          {iconName ? (
                            <Icon name={iconName} size={16} />
                          ) : (
                            <span className="px-2 text-xs">
                              {s.label ?? s.platform}
                            </span>
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 rounded-full bg-black/40 px-2 py-1 text-xs text-white hover:bg-black/60"
            >
              ✕
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
