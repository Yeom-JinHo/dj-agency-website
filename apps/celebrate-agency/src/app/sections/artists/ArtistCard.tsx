"use client";

import Image from "next/image";

import type { Artist } from "@/types/artist";

interface ArtistCardProps {
  artist: Artist;
  onSelect: (artist: Artist) => void;
}

export function ArtistCard({ artist, onSelect }: ArtistCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(artist)}
      className="group relative block w-full overflow-hidden rounded-2xl bg-neutral-900/60 transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
    >
      <div className="relative aspect-[2/3]">
        <Image
          src={artist.image}
          alt={artist.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <span className="text-sm font-medium text-white md:text-base">
          {artist.name}
        </span>
      </div>
    </button>
  );
}
