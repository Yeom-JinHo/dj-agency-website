import type { ArtistProfile } from "@/types/artist";
import React from "react";
import TextReveal from "@repo/ui/common/TextReveal";
import ArtistImage from "./ArtistImage";
interface ArtistSimpleCardProps {
  artist: ArtistProfile;
}

export default function ArtistSimpleCard({ artist }: ArtistSimpleCardProps) {
  return (
    <div>
      <div className="h-[400px] w-[300px] md:h-[520px] md:w-[350px]">
        <ArtistImage artist={artist} backgroundLogo={true} />
      </div>
      <div className="flex grow flex-col items-end justify-between gap-4 p-4">
        <div className="flex w-full flex-col gap-2">
          <div className="lg:text-3xl text-2xl leading-8 font-bold tracking-tight text-foreground">
            <TextReveal>{artist.name}</TextReveal>
          </div>
        </div>
      </div>
    </div>
  );
}
