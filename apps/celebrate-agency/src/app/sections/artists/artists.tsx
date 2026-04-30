"use client";

import { useState } from "react";

import { ARTISTS } from "@/consts/artists";
import type { Artist } from "@/types/artist";

import { ArtistCard } from "./ArtistCard";
import { ArtistDetailModal } from "./ArtistDetailModal";

export default function Artists() {
  const [selected, setSelected] = useState<Artist | null>(null);

  return (
    <section className="w-full px-6 py-16 md:px-12 md:py-20">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-4 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
        {ARTISTS.map((artist) => (
          <li key={artist.id}>
            <ArtistCard artist={artist} onSelect={setSelected} />
          </li>
        ))}
      </ul>
      <ArtistDetailModal
        artist={selected}
        onClose={() => setSelected(null)}
      />
    </section>
  );
}
