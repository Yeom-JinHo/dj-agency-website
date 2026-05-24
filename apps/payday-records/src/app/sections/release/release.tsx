"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import Image from "next/image";
import {
  IconArrowUpRight,
  IconBrandApple,
  IconBrandSoundcloud,
  IconBrandSpotify,
  IconBrandYoutube,
  IconDots,
  IconX,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import MotionWrap from "@repo/ui/common/MotionWrap";
import TextReveal from "@repo/ui/common/TextReveal";
import { BlurFade } from "@repo/ui/common/BlurFade";

import type { Release, ReleasePlatform } from "@/types/release";
import { releases } from "./config";

type IconProps = { className?: string };

const BeatportMark = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    className={className}
    aria-hidden
  >
    <circle cx="12" cy="12" r="9.5" />
    <path
      d="M9 7.5v9M9 8.5h4.2a2.6 2.6 0 0 1 0 5.2H9"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PLATFORM_META: Record<
  ReleasePlatform,
  { label: string; Icon: (props: IconProps) => ReactNode }
> = {
  beatport: { label: "Beatport", Icon: BeatportMark },
  spotify: {
    label: "Spotify",
    Icon: ({ className }: IconProps) => (
      <IconBrandSpotify className={className} />
    ),
  },
  appleMusic: {
    label: "Apple Music",
    Icon: ({ className }: IconProps) => (
      <IconBrandApple className={className} />
    ),
  },
  soundcloud: {
    label: "SoundCloud",
    Icon: ({ className }: IconProps) => (
      <IconBrandSoundcloud className={className} />
    ),
  },
  youtubeMusic: {
    label: "YouTube Music",
    Icon: ({ className }: IconProps) => (
      <IconBrandYoutube className={className} />
    ),
  },
};

const PLATFORM_ORDER: ReleasePlatform[] = [
  "beatport",
  "spotify",
  "appleMusic",
  "soundcloud",
  "youtubeMusic",
];

function Release() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const close = useCallback(() => setOpenIndex(null), []);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close]);

  const activeRelease = openIndex !== null ? releases[openIndex] : null;

  return (
    <MotionWrap className="w-full py-24 lg:py-32" id="release">
      <div className="flex flex-col items-center justify-center px-4 text-center">
        <TextReveal as="h2" className="section-heading">
          Release
        </TextReveal>
        <TextReveal
          as="p"
          className="mt-6 max-w-[640px] text-base/relaxed text-neutral-400 md:text-lg/relaxed"
        >
          From the catalog
        </TextReveal>

        <div className="mt-12 flex w-full max-w-[1200px] flex-wrap justify-center gap-8 md:gap-14">
          {releases.map((release, index) => (
            <BlurFade
              key={release.catalogNo ?? release.title}
              inView
              duration={0.6}
              delay={index * 0.08}
            >
              <button
                type="button"
                onClick={() => setOpenIndex(index)}
                className="group block w-[160px] cursor-pointer text-left md:w-[340px]"
                aria-haspopup="dialog"
                aria-label={`${release.title} - ${release.artist} 플랫폼 선택`}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                  {release.artwork ? (
                    <Image
                      src={release.artwork}
                      alt={release.title}
                      width={340}
                      height={340}
                      sizes="(max-width: 768px) 160px, 340px"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="relative flex h-full w-full items-center justify-center bg-[#0f0f0f] p-4 text-center">
                      <span className="absolute top-0 left-0 h-full w-[3px] bg-orange-500" />
                      <span className="line-clamp-3 max-w-[85%] text-lg font-semibold tracking-tight text-white/85 md:text-xl">
                        {release.title}
                      </span>
                    </div>
                  )}

                  <span className="absolute top-2.5 right-2.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/45 text-white/85 backdrop-blur-sm transition-colors duration-200 group-hover:bg-black/70 group-hover:text-white">
                    <IconDots className="h-3.5 w-3.5" stroke={2.5} />
                  </span>

                  <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/15" />
                  </div>

                <div className="mt-3 text-left">
                  <h4 className="truncate text-sm font-semibold md:text-base">
                    {release.title}
                  </h4>
                  <p className="text-muted-foreground truncate text-xs md:text-sm">
                    {release.artist}
                  </p>
                  {(release.label || release.catalogNo) && (
                    <p className="text-muted-foreground mt-1 truncate font-mono text-[10px] tracking-widest uppercase">
                      {[release.label, release.catalogNo]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              </button>
            </BlurFade>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeRelease && (
          <PlatformModal release={activeRelease} onClose={close} />
        )}
      </AnimatePresence>
    </MotionWrap>
  );
}

function PlatformModal({
  release,
  onClose,
}: {
  release: Release;
  onClose: () => void;
}) {
  const availablePlatforms = PLATFORM_ORDER.filter((p) => release.links[p]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 py-[6vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      role="dialog"
      aria-modal="true"
      aria-label={`${release.title} 플랫폼 선택`}
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-md"
      />

      <motion.div
        className="relative z-10 w-full max-w-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-2xl"
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 8 }}
        transition={{ type: "spring", damping: 26, stiffness: 320 }}
      >
        <div className="flex max-h-[88vh] flex-col overflow-y-auto">
          <div className="relative aspect-square w-full flex-shrink-0 overflow-hidden bg-[#1a1a1a]">
            {release.artwork ? (
              <Image
                src={release.artwork}
                alt={release.title}
                fill
                sizes="360px"
                className="object-cover"
              />
            ) : (
              <div className="relative flex h-full w-full items-center justify-center">
                <span className="absolute top-0 left-0 h-full w-1 bg-orange-500" />
                <span className="line-clamp-3 max-w-[80%] text-center text-2xl font-semibold tracking-tight text-white/85">
                  {release.title}
                </span>
              </div>
            )}

            <button
              type="button"
              aria-label="닫기"
              onClick={onClose}
              className="absolute top-3 right-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white/90 backdrop-blur-md transition-colors hover:bg-black/65 hover:text-white"
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>

          <div className="p-5 text-left">
            <h3 className="truncate text-base font-semibold text-white md:text-lg">
              {release.title}
            </h3>
            <p className="mt-0.5 truncate text-sm text-white/60">
              {release.artist}
            </p>
            {(release.label || release.catalogNo) && (
              <p className="mt-1.5 truncate font-mono text-[10px] tracking-widest text-white/35 uppercase">
                {[release.label, release.catalogNo]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>

          <div className="h-px w-full bg-white/[0.08]" />

          <ul className="py-1">
            {availablePlatforms.map((platform) => {
              const { label, Icon } = PLATFORM_META[platform];
              return (
                <li key={platform}>
                  <a
                    href={release.links[platform]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/row flex h-14 items-center gap-4 px-5 transition-colors hover:bg-white/[0.06]"
                  >
                    <Icon className="h-6 w-6 text-white/90" />
                    <span className="flex-1 text-sm font-medium text-white/90">
                      {label}
                    </span>
                    <IconArrowUpRight className="h-4 w-4 text-white/35 transition-colors group-hover/row:text-white/80" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default Release;
