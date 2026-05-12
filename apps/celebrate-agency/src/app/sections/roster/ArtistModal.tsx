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
      className="animate-modal-fade fixed inset-0 z-[100] overflow-y-auto bg-[rgba(5,5,5,0.86)] backdrop-blur-[8px]"
    >
      <div
        onClick={handleBackdrop}
        className="flex min-h-full items-center justify-center p-4 sm:p-8 lg:p-12"
      >
        <div className="relative flex max-h-[calc(100vh-32px)] w-full max-w-[clamp(720px,90vw,1200px)] flex-col border border-ca-line bg-ca-bg sm:max-h-[calc(100vh-64px)] lg:max-h-[calc(100vh-96px)]">
        <div className="flex flex-shrink-0 items-center justify-between border-b border-ca-line bg-ca-bg px-5 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ca-muted">
          <span>
            [ {idxLabel} / {totalLabel} ]
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="border border-ca-dim p-2 text-ca-fg transition-colors duration-200 hover:border-ca-red hover:text-ca-red"
          >
            <span
              aria-hidden="true"
              className="relative inline-block h-3 w-3 before:absolute before:left-0 before:top-1/2 before:h-px before:w-full before:rotate-45 before:bg-current after:absolute after:left-0 after:top-1/2 after:h-px after:w-full after:-rotate-45 after:bg-current"
            />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-2">
          <div className="ca-stripe-ph-lg relative aspect-[4/3] flex-shrink-0 overflow-hidden border-b border-ca-line lg:aspect-[4/5] lg:flex-shrink lg:border-b-0 lg:border-r">
            <Image
              src={artist.image}
              alt={artist.name}
              fill
              sizes="(max-width: 1024px) 100vw, 600px"
              className="object-cover"
              priority
            />
            <Corner pos="tl" />
            <Corner pos="tr" />
            <Corner pos="bl" />
            <Corner pos="br" />
          </div>

          <div className="flex min-h-0 flex-col gap-6 overflow-hidden px-5 pt-6 lg:px-10 lg:pt-8">
            <div className="flex-shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-ca-muted">
              <span>{artist.roles.join(" · ")}</span>
              <span> &nbsp;·&nbsp; </span>
              <span className="text-ca-red">{artist.city}</span>
            </div>

            <h2 className="flex-shrink-0 font-display text-[clamp(40px,10vw,104px)] uppercase leading-[0.88] tracking-[-0.005em]">
              {artist.name}
            </h2>

            {artist.socials.length > 0 ? (
              <div className="flex flex-shrink-0 flex-wrap items-center gap-5">
                {artist.socials.map((social) => {
                  const Icon = SOCIAL_ICONS[social.platform];
                  return (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={SOCIAL_LABELS[social.platform]}
                      className="text-ca-fg transition-colors duration-200 hover:text-ca-red"
                    >
                      <Icon size={32} stroke={1.75} />
                    </a>
                  );
                })}
              </div>
            ) : null}

            <div className="flex min-h-0 flex-1 flex-col">
              <h3 className="mb-3.5 flex-shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-ca-red">
                [ Selected works ]
              </h3>
              <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-6">
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

          </div>
        </div>

        <div className="flex flex-shrink-0 items-center justify-between border-t border-ca-line px-5 py-3">
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
    </div>
  );
}
