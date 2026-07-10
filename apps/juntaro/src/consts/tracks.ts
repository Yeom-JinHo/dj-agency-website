import type { JuntaroTrack } from "@/types/music";
import { SOCIALS } from "@/consts/socials";

const socialHref = (name: (typeof SOCIALS)[number]["name"]): string =>
  SOCIALS.find((social) => social.name === name)?.href ?? "";

/** Single source of truth for Juntaro's track list (mirrors consts/socials.ts). Placeholder — swap on real data arrival. */
export const TRACKS: JuntaroTrack[] = [
  {
    id: "midnight-circuit",
    name: "Midnight Circuit",
    artist: "Juntaro",
    cover: "/images/tracks/midnight-circuit.webp",
    links: [
      { platform: "YouTube", href: socialHref("YouTube"), iconName: "SiYoutube" },
      { platform: "SoundCloud", href: socialHref("SoundCloud"), iconName: "SiSoundcloud" },
      { platform: "Spotify", href: socialHref("Spotify"), iconName: "SiSpotify" },
      { platform: "Apple Music", href: socialHref("Apple Music"), iconName: "SiApple" },
      { platform: "Beatport", href: socialHref("Beatport"), iconName: "SiBeatport" },
    ],
  },
  {
    id: "seoul-pressure",
    name: "Seoul Pressure",
    artist: "Juntaro",
    cover: "/images/tracks/seoul-pressure.webp",
    links: [
      { platform: "YouTube", href: socialHref("YouTube"), iconName: "SiYoutube" },
      { platform: "SoundCloud", href: socialHref("SoundCloud"), iconName: "SiSoundcloud" },
      { platform: "Spotify", href: socialHref("Spotify"), iconName: "SiSpotify" },
      { platform: "Apple Music", href: socialHref("Apple Music"), iconName: "SiApple" },
      { platform: "Beatport", href: socialHref("Beatport"), iconName: "SiBeatport" },
    ],
  },
  {
    id: "concrete-groove",
    name: "Concrete Groove",
    artist: "Juntaro",
    cover: "/images/tracks/concrete-groove.webp",
    links: [
      { platform: "YouTube", href: socialHref("YouTube"), iconName: "SiYoutube" },
      { platform: "SoundCloud", href: socialHref("SoundCloud"), iconName: "SiSoundcloud" },
      { platform: "Spotify", href: socialHref("Spotify"), iconName: "SiSpotify" },
      { platform: "Apple Music", href: socialHref("Apple Music"), iconName: "SiApple" },
      { platform: "Beatport", href: socialHref("Beatport"), iconName: "SiBeatport" },
    ],
  },
  {
    id: "afterhours-signal",
    name: "Afterhours Signal",
    artist: "Juntaro",
    cover: "/images/tracks/afterhours-signal.webp",
    links: [
      { platform: "YouTube", href: socialHref("YouTube"), iconName: "SiYoutube" },
      { platform: "SoundCloud", href: socialHref("SoundCloud"), iconName: "SiSoundcloud" },
      { platform: "Spotify", href: socialHref("Spotify"), iconName: "SiSpotify" },
      { platform: "Apple Music", href: socialHref("Apple Music"), iconName: "SiApple" },
      { platform: "Beatport", href: socialHref("Beatport"), iconName: "SiBeatport" },
    ],
  },
  {
    id: "low-end-district",
    name: "Low End District",
    artist: "Juntaro",
    cover: "/images/tracks/low-end-district.webp",
    links: [
      { platform: "YouTube", href: socialHref("YouTube"), iconName: "SiYoutube" },
      { platform: "SoundCloud", href: socialHref("SoundCloud"), iconName: "SiSoundcloud" },
      { platform: "Spotify", href: socialHref("Spotify"), iconName: "SiSpotify" },
      { platform: "Apple Music", href: socialHref("Apple Music"), iconName: "SiApple" },
      { platform: "Beatport", href: socialHref("Beatport"), iconName: "SiBeatport" },
    ],
  },
];
