import type { ReactNode } from "react";
import {
  IconBrandApple,
  IconBrandSoundcloud,
  IconBrandSpotify,
  IconBrandYoutube,
} from "@tabler/icons-react";

import type { ReleasePlatform } from "@/types/release";

export type IconProps = { className?: string };

const BeatportMark = ({ className }: IconProps) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
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

export const PLATFORM_META: Record<
  ReleasePlatform,
  { label: string; brand: string; Icon: (props: IconProps) => ReactNode }
> = {
  beatport: { label: "Beatport", brand: "#01FF95", Icon: BeatportMark },
  spotify: {
    label: "Spotify",
    brand: "#1DB954",
    Icon: ({ className }: IconProps) => (
      <IconBrandSpotify className={className} stroke={1.75} />
    ),
  },
  appleMusic: {
    label: "Apple Music",
    brand: "#FA2D48",
    Icon: ({ className }: IconProps) => (
      <IconBrandApple className={className} stroke={1.75} />
    ),
  },
  soundcloud: {
    label: "SoundCloud",
    brand: "#FF5500",
    Icon: ({ className }: IconProps) => (
      <IconBrandSoundcloud className={className} stroke={1.75} />
    ),
  },
  youtubeMusic: {
    label: "YouTube Music",
    brand: "#FF0000",
    Icon: ({ className }: IconProps) => (
      <IconBrandYoutube className={className} stroke={1.75} />
    ),
  },
};

export const PLATFORM_ORDER: ReleasePlatform[] = [
  "beatport",
  "spotify",
  "appleMusic",
  "soundcloud",
  "youtubeMusic",
];
