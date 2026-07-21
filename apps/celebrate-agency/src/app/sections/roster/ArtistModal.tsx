"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  IconBrandBandcamp,
  IconBrandInstagram,
  IconBrandSoundcloud,
  IconBrandSpotify,
  IconBrandTiktok,
  IconBrandX,
  IconBrandYoutube,
  IconLink,
  IconX,
  type Icon as TablerIcon,
} from "@tabler/icons-react";

import { Icon } from "@repo/ui/common/Icon";
import type { IconName } from "@repo/ui/common/Icon";

import { ARTIST_ROLE_LABEL } from "@/consts/artists";
import type { Artist, ArtistSocialPlatform } from "@/types/artist";

import { ArtistPortrait } from "./ArtistPortrait";

/**
 * tabler(스트로크 아웃라인)와 simple-icons(면 글리프, @repo/ui Icon 경유)를 한 줄에
 * 섞어 렌더하기 위한 판별 유니온. 렌더 쪽에서 두 종류 모두 동일한 48px 박스에
 * 넣어 터치 타깃과 행 정렬을 통일하고, si는 내부 크기만 26px로 낮춰 면 글리프가
 * 스트로크 아이콘보다 무거워 보이는 걸 광학적으로 보정한다.
 */
type SocialIconDef =
  | { kind: "tabler"; Component: TablerIcon }
  | { kind: "si"; name: IconName };

const SOCIAL_ICONS: Record<ArtistSocialPlatform, SocialIconDef> = {
  soundcloud: { kind: "tabler", Component: IconBrandSoundcloud },
  instagram: { kind: "tabler", Component: IconBrandInstagram },
  spotify: { kind: "tabler", Component: IconBrandSpotify },
  youtube: { kind: "tabler", Component: IconBrandYoutube },
  x: { kind: "tabler", Component: IconBrandX },
  beatport: { kind: "si", name: "SiBeatport" },
  appleMusic: { kind: "si", name: "SiApplemusic" },
  youtubeMusic: { kind: "si", name: "SiYoutubemusic" },
  bandcamp: { kind: "tabler", Component: IconBrandBandcamp },
  tiktok: { kind: "tabler", Component: IconBrandTiktok },
  etc: { kind: "tabler", Component: IconLink },
};

const SOCIAL_LABELS: Record<ArtistSocialPlatform, string> = {
  soundcloud: "SoundCloud",
  instagram: "Instagram",
  spotify: "Spotify",
  youtube: "YouTube",
  x: "X",
  beatport: "Beatport",
  appleMusic: "Apple Music",
  youtubeMusic: "YouTube Music",
  bandcamp: "Bandcamp",
  tiktok: "TikTok",
  etc: "Link",
};

const SOCIAL_HOVER: Record<ArtistSocialPlatform, string> = {
  soundcloud: "hover:text-[#FF5500] active:text-[#FF5500]",
  instagram: "hover:text-[#E1306C] active:text-[#E1306C]",
  spotify: "hover:text-[#1ED760] active:text-[#1ED760]",
  youtube: "hover:text-[#FF0000] active:text-[#FF0000]",
  x: "hover:text-white active:text-white",
  beatport: "hover:text-[#01FF95] active:text-[#01FF95]",
  appleMusic: "hover:text-[#FA243C] active:text-[#FA243C]",
  youtubeMusic: "hover:text-[#FF0000] active:text-[#FF0000]",
  // Bandcamp 공식(#408294, 채도 40%)과 다크 배경 대비 사이의 절충 중간톤(대비 약 5.4:1).
  bandcamp: "hover:text-[#3190AA] active:text-[#3190AA]",
  // TikTok 공식 로고는 흑색이라 다크 배경에 묻힘. x(흰색)와 겹치지 않도록
  // 브랜드 시그니처 핑크/레드로 대체해 식별성을 유지한다.
  tiktok: "hover:text-[#FE2C55] active:text-[#FE2C55]",
  // 폴백 링크는 브랜드가 아니므로 중립 회색 — ca-red를 주면 레드 계열 브랜드들 사이에
  // "가짜 6번째 레드"가 끼어들어 색 구분을 더 흐린다.
  etc: "hover:text-ca-muted active:text-ca-muted",
};

const CHROME_BUTTON =
  "border border-ca-dim text-ca-fg transition-colors duration-200 hover:border-ca-red hover:text-ca-red active:border-ca-red active:text-ca-red";

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const modalInnerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const handleBackdrop = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const inner = modalInnerRef.current;
      if (inner && inner.contains(event.target as Node)) return;
      onClose();
    },
    [onClose]
  );

  useEffect(() => {
    closeButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        const target = event.target as HTMLElement | null;
        const inEditable =
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement ||
          target instanceof HTMLSelectElement ||
          target?.isContentEditable === true;
        if (inEditable) return;
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
      className="animate-modal-fade fixed inset-0 z-[100] overflow-y-auto bg-[rgba(5,5,5,0.86)] outline-none backdrop-blur-[8px]"
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
          className="animate-modal-pop relative flex max-h-[calc(100dvh-32px)] w-full flex-col border border-ca-line bg-ca-bg sm:max-h-[calc(100dvh-64px)] sm:max-w-[clamp(720px,90vw,1100px)] lg:max-h-[calc(100dvh-96px)]"
        >
          <div className="flex flex-shrink-0 items-center justify-between border-b border-ca-line bg-ca-bg px-5 py-3 font-mono text-[12px] uppercase tracking-[0.14em] text-ca-muted lg:text-[13px]">
            <span>
              [ {idxLabel} / {totalLabel} ]
            </span>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={onClose}
              aria-label={`Close ${artist.name} profile`}
              className={`${CHROME_BUTTON} p-2`}
            >
              <IconX size={14} stroke={1.75} />
            </button>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[auto_1fr] overflow-hidden lg:grid-cols-[minmax(460px,520px)_1fr] lg:grid-rows-1">
            <div className="flex justify-center border-b border-ca-line p-4 sm:p-5 lg:items-start lg:border-b-0 lg:border-r lg:p-0">
              <div className="relative aspect-[3/4] w-3/4 max-w-[320px] overflow-hidden bg-ca-bg-2 lg:w-full lg:max-w-none">
                <ArtistPortrait
                  key={artist.id}
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
                  {artist.socials.map((social, index) => {
                    const def = SOCIAL_ICONS[social.platform];
                    return (
                      <a
                        // CMS 소셜은 "etc"로 흡수되는 플랫폼이 복수 존재할 수 있어 platform 단독 key는 충돌.
                        key={`${social.platform}-${index}`}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${SOCIAL_LABELS[social.platform]} (opens in new tab)`}
                        className={`flex size-12 items-center justify-center text-ca-fg transition-colors duration-200 ${SOCIAL_HOVER[social.platform]}`}
                      >
                        {def.kind === "tabler" ? (
                          <def.Component size={32} stroke={1.75} />
                        ) : (
                          <Icon name={def.name} size={26} />
                        )}
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
              onClick={onPrev}
              aria-label={`Previous artist: ${prevArtist.name}`}
              className={`${CHROME_BUTTON} px-4 py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] lg:text-[13px]`}
            >
              ← Prev
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label={`Next artist: ${nextArtist.name}`}
              className={`${CHROME_BUTTON} px-4 py-2.5 font-mono text-[12px] uppercase tracking-[0.14em] lg:text-[13px]`}
            >
              Next →
            </button>
          </div>

          {(prevArtist.image ?? nextArtist.image) ? (
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
