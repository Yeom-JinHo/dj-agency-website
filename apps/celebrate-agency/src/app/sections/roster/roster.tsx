import Image from "next/image";

import { Corner } from "@/components/Corner";
import { SectionHead } from "@/components/SectionHead";
import { ARTISTS } from "@/consts/artists";

const ROSTER_CAP = 8;
const BOOKING_EMAIL = "book@celebrate.agency";

export default function Roster() {
  return (
    <section id="roster" className="border-t border-ca-line pt-[120px] pb-0">
      <SectionHead
        num="02"
        numLabel="ROSTER"
        title="Roster"
        aside={`${ARTISTS.length} of ${ROSTER_CAP} · By invitation.`}
      />
      <div className="grid grid-cols-2 gap-px border-y border-ca-line bg-ca-line lg:grid-cols-4">
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
                sizes="(max-width: 1024px) 50vw, 25vw"
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

        <a
          href={`mailto:${BOOKING_EMAIL}`}
          className="group relative block bg-ca-red p-6 transition-colors hover:bg-ca-red-dim"
        >
          <div className="relative mb-[18px] flex aspect-[3/4] flex-col justify-end overflow-hidden border border-ca-fg/20 p-4">
            <span className="font-display text-[clamp(40px,4.5vw,64px)] uppercase leading-[0.86] tracking-[-0.005em] text-ca-fg">
              Book
              <br />a Set
              <span aria-hidden="true"> ↗</span>
            </span>
          </div>
          <div className="mb-1.5 font-display text-3xl uppercase leading-none tracking-[0.01em] text-ca-fg">
            Booking
          </div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.08em] text-ca-fg/80">
            <span>Brief</span>
            <span>MAIL ↗</span>
          </div>
        </a>

        <div className="relative block bg-ca-bg p-6">
          <div className="ca-stripe-ph relative mb-[18px] aspect-[3/4] overflow-hidden border border-ca-line">
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />
            <span className="absolute inset-0 flex items-center justify-center font-display text-[clamp(48px,6vw,80px)] uppercase leading-none tracking-[0.02em] text-ca-dim">
              [ 08 ]
            </span>
          </div>
          <div className="mb-1.5 font-display text-3xl uppercase leading-none tracking-[0.01em] text-ca-muted">
            Reserved
          </div>
          <div className="flex justify-between font-mono text-[11px] uppercase tracking-[0.08em] text-ca-muted">
            <span>By invitation</span>
            <span aria-hidden="true">—</span>
          </div>
        </div>
      </div>
    </section>
  );
}
