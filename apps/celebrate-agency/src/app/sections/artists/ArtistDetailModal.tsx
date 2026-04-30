"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";

import type { Artist } from "@/types/artist";

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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={artist.name}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-neutral-900 text-white shadow-2xl"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
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
                  {artist.socials.map((s) => (
                    <li key={`${s.platform}-${s.url}`}>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-white/20 px-3 py-1 text-xs hover:bg-white/10"
                      >
                        {s.label ?? s.platform}
                      </a>
                    </li>
                  ))}
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
