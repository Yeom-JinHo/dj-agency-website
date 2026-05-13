"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";

import { Corner } from "@/components/Corner";
import { SectionHead } from "@/components/SectionHead";
import { Tape } from "@/components/Tape";
import { ARTIST_ROLE_LABEL, ARTISTS } from "@/consts/artists";
import { BOOKING_EMAIL } from "@/consts/brand";

import { ArtistModal } from "./ArtistModal";

export default function Roster() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndexRef = useRef<number | null>(null);
  activeIndexRef.current = activeIndex;

  const open = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);
  const close = useCallback(() => {
    const idx = activeIndexRef.current;
    setActiveIndex(null);
    requestAnimationFrame(() => {
      if (idx !== null) triggerRefs.current[idx]?.focus();
    });
  }, []);
  const step = useCallback(
    (delta: number) =>
      setActiveIndex((current) =>
        current === null
          ? current
          : (current + delta + ARTISTS.length) % ARTISTS.length
      ),
    []
  );
  const onPrev = useCallback(() => step(-1), [step]);
  const onNext = useCallback(() => step(1), [step]);

  return (
    <section
      id="roster"
      className="border-t border-ca-line pt-20 pb-0 lg:pt-[120px]"
    >
      <SectionHead
        num="02"
        numLabel="ROSTER"
        title="Roster"
        aside={`${ARTISTS.length} artists · By invitation.`}
      />
      <div className="grid grid-cols-2 gap-px border-y border-ca-line bg-ca-line lg:grid-cols-4">
        {ARTISTS.map((artist, index) => (
          <button
            key={artist.id}
            ref={(el) => {
              triggerRefs.current[index] = el;
            }}
            type="button"
            onClick={() => open(index)}
            aria-haspopup="dialog"
            aria-label={`View ${artist.name} profile`}
            className="group relative block w-full bg-ca-bg p-6 text-left transition-colors duration-300 hover:bg-[#1a1a1a]"
          >
            <div className="relative mb-[18px] aspect-[3/4]">
              <div className="absolute inset-0 overflow-hidden bg-ca-bg-2">
                <Image
                  src={artist.image}
                  alt={artist.name}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="transform-gpu object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                />
              </div>
              <Tape pos="tl" />
              <Tape pos="tr" />
              <Tape pos="bl" />
              <Tape pos="br" />
            </div>
            <div className="mb-1.5 font-display text-3xl uppercase leading-none tracking-[0.01em] transition-colors duration-300 group-hover:text-ca-red">
              {artist.name}
            </div>
            <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.08em] text-ca-muted">
              <span className="lg:text-[13px]">{ARTIST_ROLE_LABEL}</span>
              <span className="text-ca-red">SEOUL</span>
            </div>
          </button>
        ))}

        <a
          href={`mailto:${BOOKING_EMAIL}`}
          className="group relative hidden bg-ca-red p-6 transition-colors hover:bg-ca-red-dim lg:block"
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

        <div className="relative hidden bg-ca-bg p-6 lg:block">
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

      {activeIndex !== null ? (
        <ArtistModal
          artists={ARTISTS}
          index={activeIndex}
          onClose={close}
          onPrev={onPrev}
          onNext={onNext}
        />
      ) : null}
    </section>
  );
}
