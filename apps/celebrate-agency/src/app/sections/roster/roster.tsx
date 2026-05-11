import Image from "next/image";

import { Corner } from "@/components/Corner";
import { SectionHead } from "@/components/SectionHead";
import { ARTISTS } from "@/consts/artists";

export default function Roster() {
  return (
    <section id="roster" className="border-t border-ca-line pt-[120px] pb-0">
      <SectionHead
        num="02"
        numLabel="ROSTER"
        title="Roster"
        aside={`${ARTISTS.length} artists. By invitation.`}
      />
      <div className="grid grid-cols-2 gap-px border-y border-ca-line bg-ca-line lg:grid-cols-3">
        {ARTISTS.map((artist) => (
          <a
            key={artist.id}
            href="#"
            className="group relative block bg-ca-bg p-6 transition-colors hover:bg-ca-bg-2"
          >
            <div className="relative mb-[18px] aspect-[3/4] overflow-hidden border border-ca-line bg-ca-bg-2">
              <Image
                src={artist.image}
                alt={artist.name}
                fill
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <Corner pos="tl" />
              <Corner pos="tr" />
              <Corner pos="bl" />
              <Corner pos="br" />
            </div>
            <div className="mb-1.5 font-display text-3xl uppercase leading-none tracking-[0.01em]">
              {artist.name}
            </div>
            <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.08em] text-ca-muted">
              <span>DJ</span>
              <span className="text-ca-red">SEL ↗</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
