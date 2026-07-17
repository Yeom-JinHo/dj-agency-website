"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  IconBrandInstagram,
  IconBrandSoundcloud,
  IconBrandSpotify,
  IconBrandX,
  IconBrandYoutube,
  IconLink,
  IconX,
  type Icon as TablerIcon,
} from "@tabler/icons-react";

import { ARTIST_ROLE_LABEL } from "@/consts/artists";
import type { Artist, ArtistSocialPlatform } from "@/types/artist";

import { ArtistPortrait } from "./ArtistPortrait";

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

const SOCIAL_HOVER: Record<ArtistSocialPlatform, string> = {
  soundcloud: "hover:text-[#FF5500] active:text-[#FF5500]",
  instagram: "hover:text-[#E1306C] active:text-[#E1306C]",
  spotify: "hover:text-[#1ED760] active:text-[#1ED760]",
  youtube: "hover:text-[#FF0000] active:text-[#FF0000]",
  x: "hover:text-white active:text-white",
  etc: "hover:text-ca-red active:text-ca-red",
};

const CHROME_BUTTON =
  "border border-ca-dim text-ca-fg transition-colors duration-200 hover:border-ca-red hover:text-ca-red active:border-ca-red active:text-ca-red";

interface ArtistModalProps {
  artists: Artist[];
  index: number;
  /** true면 exit 애니메이션 재생 중 — 끝나면 onExited로 언마운트를 알린다. */
  closing: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onExited: () => void;
}

export function ArtistModal({
  artists,
  index,
  closing,
  onClose,
  onPrev,
  onNext,
  onExited,
}: ArtistModalProps) {
  const artist = artists[index];
  const total = artists.length;
  const dialogRef = useRef<HTMLDivElement>(null);
  const modalInnerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closingRef = useRef(closing);
  closingRef.current = closing;

  // exit 중 입력 가드: backdrop은 클릭을 계속 흡수하되 액션만 무시.
  // 버튼의 네이티브 Enter/Space 활성화도 같은 경로로 막는다.
  const handleClose = useCallback(() => {
    if (!closingRef.current) onClose();
  }, [onClose]);
  const handlePrev = useCallback(() => {
    if (!closingRef.current) onPrev();
  }, [onPrev]);
  const handleNext = useCallback(() => {
    if (!closingRef.current) onNext();
  }, [onNext]);

  const handleBackdrop = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const inner = modalInnerRef.current;
      if (inner && inner.contains(event.target as Node)) return;
      handleClose();
    },
    [handleClose]
  );

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  // transitionend 유실(확장프로그램의 transition 무력화 등) 대비 언마운트 폴백 —
  // 없으면 body overflow:hidden이 영구 잔류할 수 있다.
  useEffect(() => {
    if (!closing) return;
    const timer = setTimeout(onExited, 300);
    return () => clearTimeout(timer);
  }, [closing, onExited]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onKey = (event: KeyboardEvent) => {
      // Tab 포커스 트랩은 exit 중에도 유지 — aria-modal인 다이얼로그가 떠 있는
      // 동안 포커스가 배경으로 새면 안 된다. Escape/Arrow만 closing 가드.
      if (event.key === "Escape") {
        if (!closingRef.current) onClose();
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        const target = event.target as HTMLElement | null;
        const inEditable =
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement ||
          target?.isContentEditable === true;
        if (inEditable || closingRef.current) return;
        if (event.key === "ArrowLeft") onPrev();
        else onNext();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = dialog.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0]!;
      const last = focusable[focusable.length - 1]!;
      const active = document.activeElement as HTMLElement | null;
      const focusInside = !!active && dialog.contains(active);

      if (event.shiftKey) {
        if (!focusInside || active === first) {
          event.preventDefault();
          last.focus();
        }
      } else {
        if (!focusInside || active === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, onPrev, onNext]);

  if (!artist || total === 0) return null;

  const idxLabel = String(index + 1).padStart(2, "0");
  const totalLabel = String(total).padStart(2, "0");
  const prevArtist = artists[(index - 1 + total) % total]!;
  const nextArtist = artists[(index + 1) % total]!;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${artist.name} profile`}
      tabIndex={-1}
      onClick={handleBackdrop}
      onTransitionEnd={(event) => {
        if (
          closing &&
          event.target === event.currentTarget &&
          event.propertyName === "opacity"
        )
          onExited();
      }}
      className={`${
        closing ? "opacity-0" : "animate-modal-fade"
      } fixed inset-0 z-[100] overflow-y-auto bg-[rgba(5,5,5,0.86)] outline-none backdrop-blur-[8px] transition-opacity duration-150 ease-in`}
    >
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {artist.name}, {idxLabel} of {totalLabel}
      </div>
      <div className="flex min-h-full items-center justify-center p-4 sm:p-8 lg:p-12">
        <div
          ref={modalInnerRef}
          className={`${
            closing ? "scale-[0.97] translate-y-[6px]" : "animate-modal-pop"
          } relative flex max-h-[calc(100dvh-32px)] w-full flex-col border border-ca-line bg-ca-bg transition-transform duration-150 ease-in sm:max-h-[calc(100dvh-64px)] sm:max-w-[clamp(720px,90vw,1100px)] lg:max-h-[calc(100dvh-96px)]`}
        >
          <div className="flex flex-shrink-0 items-center justify-between border-b border-ca-line bg-ca-bg px-5 py-2 font-mono text-[12px] uppercase tracking-[0.14em] text-ca-muted lg:text-[13px]">
            <span>
              [ {idxLabel} / {totalLabel} ]
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={handleClose}
              aria-label={`Close ${artist.name} profile`}
              className={`${CHROME_BUTTON} flex min-h-[44px] min-w-[44px] items-center justify-center`}
            >
              <IconX size={14} stroke={1.75} />
            </button>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_1fr] overflow-hidden lg:grid-cols-[minmax(460px,520px)_1fr] lg:grid-rows-1">
            <div className="flex justify-center border-b border-ca-line p-4 sm:p-5 lg:items-start lg:border-b-0 lg:border-r lg:p-0">
              <div
                key={artist.id}
                className="ca-portrait-in relative aspect-[3/4] w-3/4 max-w-[320px] overflow-hidden bg-ca-bg-2 lg:w-full lg:max-w-none"
              >
                <ArtistPortrait
                  image={artist.image}
                  name={artist.name}
                  variant="modal"
                  sizes="(max-width: 1024px) 60vw, 600px"
                  priority
                />
              </div>
            </div>

            <div
              key={artist.id}
              className="flex min-h-0 flex-col gap-4 overflow-y-auto px-5 pt-5 pb-5 lg:gap-6 lg:overflow-hidden lg:px-10 lg:pt-8 lg:pb-0"
            >
              <div className="flex-shrink-0 font-mono text-[12px] uppercase tracking-[0.14em] text-ca-muted lg:text-[13px]">
                <span>{ARTIST_ROLE_LABEL}</span>
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
                        aria-label={`${SOCIAL_LABELS[social.platform]} (opens in new tab)`}
                        className={`p-2 text-ca-fg transition-colors duration-200 ${SOCIAL_HOVER[social.platform]}`}
                      >
                        <Icon size={32} stroke={1.75} />
                      </a>
                    );
                  })}
                </div>
              ) : null}

              <p className="max-w-[52ch] flex-shrink-0 text-base leading-relaxed text-ca-fg lg:text-lg">
                {artist.bio}
              </p>

              <div className="flex flex-col lg:min-h-0 lg:flex-1">
                <h3 className="mb-3.5 flex-shrink-0 font-mono text-[11px] uppercase tracking-[0.16em] text-ca-red lg:text-[13px]">
                  [ Selected works ]
                </h3>
                <div className="flex flex-col pb-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:pb-6">
                  {artist.selectedWorks.map((work, i) => (
                    <div
                      key={work.id}
                      className={`grid grid-cols-[36px_1fr_auto] items-baseline gap-4 border-t border-ca-line py-3.5 text-base ${
                        i === artist.selectedWorks.length - 1 ? "border-b" : ""
                      }`}
                    >
                      <span className="font-mono text-[11px] tracking-[0.14em] text-ca-muted lg:text-[13px]">
                        {work.id}
                      </span>
                      <span className="font-sans font-medium">
                        {work.title}
                      </span>
                      <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-ca-muted lg:text-[13px]">
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
              onClick={handlePrev}
              aria-label={`Previous artist: ${prevArtist.name}`}
              className={`${CHROME_BUTTON} px-4 py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] lg:text-[13px]`}
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label={`Next artist: ${nextArtist.name}`}
              className={`${CHROME_BUTTON} px-4 py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] lg:text-[13px]`}
            >
              Next →
            </button>
          </div>

          {/* prev/next 프리로드: eager가 없으면 lazy + size-0 조합으로 fetch
              자체가 생략된다. priority(high)는 메인 포트레이트와 대역폭을
              경쟁하므로 쓰지 않는다. */}
          {(prevArtist.image || nextArtist.image) ? (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute size-0 overflow-hidden opacity-0"
            >
              {prevArtist.image ? (
                <div className="relative aspect-[3/4] w-[600px]">
                  <ArtistPortrait
                    image={prevArtist.image}
                    name={prevArtist.name}
                    variant="modal"
                    sizes="(max-width: 1024px) 60vw, 600px"
                    loading="eager"
                  />
                </div>
              ) : null}
              {nextArtist.image ? (
                <div className="relative aspect-[3/4] w-[600px]">
                  <ArtistPortrait
                    image={nextArtist.image}
                    name={nextArtist.name}
                    variant="modal"
                    sizes="(max-width: 1024px) 60vw, 600px"
                    loading="eager"
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
