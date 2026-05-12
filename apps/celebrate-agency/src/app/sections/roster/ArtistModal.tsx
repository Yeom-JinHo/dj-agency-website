"use client";

import { useCallback, useEffect } from "react";
import Image from "next/image";
import {
  IconBrandInstagram,
  IconBrandSoundcloud,
  IconBrandSpotify,
  IconBrandX,
  IconBrandYoutube,
  IconLink,
  type Icon as TablerIcon,
} from "@tabler/icons-react";

import { Corner } from "@/components/Corner";
import type { Artist, ArtistSocialPlatform } from "@/types/artist";

const SOCIAL_ICONS: Record<ArtistSocialPlatform, TablerIcon> = {
  soundcloud: IconBrandSoundcloud,
  instagram: IconBrandInstagram,
  spotify: IconBrandSpotify,
  youtube: IconBrandYoutube,
  x: IconBrandX,
  etc: IconLink,
};

const SOCIAL_LABELS: Record<ArtistSocialPlatform, string> = {
  soundcloud: "SoundCloud",
  instagram: "Instagram",
  spotify: "Spotify",
  youtube: "YouTube",
  x: "X",
  etc: "Link",
};

interface ArtistModalProps {
  artists: Artist[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export function ArtistModal({
  artists,
  index,
  onClose,
  onPrev,
  onNext,
}: ArtistModalProps) {
  const artist = artists[index];
  const total = artists.length;

  const handleBackdrop = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.target === event.currentTarget) onClose();
    },
    [onClose]
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      else if (event.key === "ArrowLeft") onPrev();
      else if (event.key === "ArrowRight") onNext();
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onPrev, onNext]);

  if (!artist) return null;

  const idxLabel = String(index + 1).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${artist.name} profile`}
      onClick={handleBackdrop}
      className="animate-modal-fade fixed inset-0 z-[100] overflow-y-auto bg-[rgba(5,5,5,0.86)] backdrop-blur-[8px]"
    >
      <div className="relative mx-auto my-12 min-h-[calc(100vh-96px)] max-w-[1280px] border border-ca-line bg-ca-bg">
        <div className="sticky top-0 z-[2] flex items-center justify-between border-b border-ca-line bg-ca-bg px-7 py-[18px] font-mono text-[11px] uppercase tracking-[0.14em] text-ca-muted">
          <span>
            [ {idxLabel} / {totalLabel} ] &nbsp; / &nbsp; ARTIST PROFILE &nbsp;
            · &nbsp; <span className="text-ca-red">●</span>{" "}
            <span>{artist.cityCode}</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center gap-2.5 border border-ca-dim px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ca-fg transition-colors duration-200 hover:border-ca-red hover:text-ca-red"
          >
            <span
              aria-hidden="true"
              className="relative inline-block h-2.5 w-2.5 before:absolute before:left-0 before:top-1/2 before:h-px before:w-full before:rotate-45 before:bg-current after:absolute after:left-0 after:top-1/2 after:h-px after:w-full after:-rotate-45 after:bg-current"
            />
            Close
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="ca-stripe-ph-lg relative aspect-square overflow-hidden border-b border-ca-line md:aspect-[3/4] md:border-b-0 md:border-r">
            <Image
              src={artist.image}
              alt={artist.name}
              fill
              sizes="(max-width: 880px) 100vw, 640px"
              className="object-cover"
              priority
            />
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />
          </div>

          <div className="flex flex-col gap-8 px-5 pt-6 md:px-10 md:pt-8">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ca-muted">
              <span>{artist.roles.join(" · ")}</span>
              <span> &nbsp;·&nbsp; </span>
              <span className="text-ca-red">{artist.city}</span>
            </div>

            <h2 className="font-display text-[clamp(56px,7vw,104px)] uppercase leading-[0.88] tracking-[-0.005em]">
              {artist.name}
            </h2>

            <div>
              <h3 className="mb-3.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ca-red">
                [ Selected works ]
              </h3>
              <div className="flex flex-col">
                {artist.selectedWorks.map((work, i) => (
                  <div
                    key={work.id}
                    className={`grid grid-cols-[36px_1fr_auto] items-baseline gap-4 border-t border-ca-line py-3.5 text-sm ${
                      i === artist.selectedWorks.length - 1
                        ? "border-b"
                        : ""
                    }`}
                  >
                    <span className="font-mono text-[10px] tracking-[0.14em] text-ca-muted">
                      {work.id}
                    </span>
                    <span className="font-sans font-medium">{work.title}</span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-ca-muted">
                      {work.meta}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {artist.socials.length > 0 ? (
              <div>
                <h3 className="mb-3.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ca-red">
                  [ Listen / Follow ]
                </h3>
                <div className="flex flex-wrap items-center gap-4">
                  {artist.socials.map((social) => {
                    const Icon = SOCIAL_ICONS[social.platform];
                    return (
                      <a
                        key={social.platform}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={SOCIAL_LABELS[social.platform]}
                        className="text-ca-muted transition-colors duration-200 hover:text-ca-red"
                      >
                        <Icon size={22} stroke={1.5} />
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-ca-line px-7 py-6">
          <button
            type="button"
            onClick={onPrev}
            className="border border-ca-dim px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ca-fg transition-colors duration-200 hover:border-ca-red hover:text-ca-red"
          >
            ← Prev
          </button>
          <button
            type="button"
            onClick={onNext}
            className="border border-ca-dim px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ca-fg transition-colors duration-200 hover:border-ca-red hover:text-ca-red"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
