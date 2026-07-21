"use client";

import { useCallback, useRef, useState } from "react";

import { SectionHead } from "@/components/SectionHead";
import { TapeCorners } from "@/components/Tape";
import { ARTIST_ROLE_LABEL } from "@/consts/artists";
import type { Artist } from "@/types/artist";

import { ArtistModal } from "./ArtistModal";
import { ArtistPortrait } from "./ArtistPortrait";
import { BookingFiller, ReservedFiller } from "./RosterFiller";

const MOBILE_COLS = 2;
const DESKTOP_COLS = 4;

export default function Roster({ artists }: { artists: Artist[] }) {
  const mobileFillerCount =
    (MOBILE_COLS - (artists.length % MOBILE_COLS)) % MOBILE_COLS;
  const desktopFillerCount =
    (DESKTOP_COLS - (artists.length % DESKTOP_COLS)) % DESKTOP_COLS;
  const reservedSlotLabel = String(artists.length + 2).padStart(2, "0");

  const getFillerVisibility = (index: number): string | null => {
    const onMobile = index < mobileFillerCount;
    const onDesktop = index < desktopFillerCount;
    if (!onMobile && !onDesktop) return null;
    if (onMobile && onDesktop) return "block";
    if (onDesktop) return "hidden lg:block";
    return "block lg:hidden";
  };

  const bookingVisibility = getFillerVisibility(0);
  const reservedVisibility = getFillerVisibility(1);

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
          : (current + delta + artists.length) % artists.length
      ),
    [artists.length]
  );
  const onPrev = useCallback(() => step(-1), [step]);
  const onNext = useCallback(() => step(1), [step]);

  return (
    <section
      id="roster"
      aria-labelledby="roster-heading"
      className="border-t border-ca-line pt-20 pb-0 lg:pt-[120px]"
    >
      <SectionHead
        num="01"
        numLabel="TALENT"
        title="Roster"
        headingId="roster-heading"
        aside={`${artists.length} artists · By invitation.`}
      />
      <div className="grid grid-cols-2 gap-px border-y border-ca-line bg-ca-line lg:grid-cols-4">
        {artists.map((artist, index) => (
          <button
            key={artist.id}
            ref={(el) => {
              triggerRefs.current[index] = el;
            }}
            type="button"
            onClick={() => open(index)}
            aria-haspopup="dialog"
            aria-label={`View ${artist.name} profile`}
            className="group relative block w-full bg-ca-bg p-6 text-left transition-colors duration-300 hover:bg-ca-bg-hover active:bg-ca-bg-hover focus-visible:z-10"
          >
            <div className="relative mb-[18px] aspect-[3/4]">
              <div className="absolute inset-0 overflow-hidden bg-ca-bg-2">
                <ArtistPortrait
                  image={artist.image}
                  name={artist.name}
                  variant="card"
                  sizes="(max-width: 1024px) 50vw, 25vw"
                />
              </div>
              <TapeCorners />
            </div>
            <div className="mb-1.5 font-display text-3xl uppercase leading-none tracking-[0.01em] transition-colors duration-300 group-hover:text-ca-red group-active:text-ca-red">
              {artist.name}
            </div>
            <div className="flex items-baseline justify-between font-mono text-[11px] uppercase tracking-[0.08em] text-ca-muted lg:text-[13px]">
              <span>{ARTIST_ROLE_LABEL}</span>
              <span className="text-ca-red">{artist.city}</span>
            </div>
          </button>
        ))}

        {bookingVisibility !== null ? (
          <BookingFiller visibility={bookingVisibility} />
        ) : null}

        {reservedVisibility !== null ? (
          <ReservedFiller
            visibility={reservedVisibility}
            slotLabel={reservedSlotLabel}
          />
        ) : null}
      </div>

      {activeIndex !== null ? (
        <ArtistModal
          artists={artists}
          index={activeIndex}
          onClose={close}
          onPrev={onPrev}
          onNext={onNext}
        />
      ) : null}
    </section>
  );
}
