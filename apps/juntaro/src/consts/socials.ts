import type { IconName } from "@repo/ui/common/Icon";

export type Social = {
  name: string;
  href: string;
  iconName: IconName;
  /** hover 시 점등할 플랫폼 공식 컬러(흰 배경 대비 고려). */
  brandColor: string;
};

/** Single source of truth for Juntaro's SNS links (mirrors VFL source.ts). */
export const SOCIALS: Social[] = [
  {
    name: "YouTube",
    href: "https://www.youtube.com/@JUNTAROMUSIC",
    iconName: "SiYoutube",
    brandColor: "#FF0000",
  },
  {
    name: "SoundCloud",
    href: "https://soundcloud.com/juntaromusic",
    iconName: "SiSoundcloud",
    brandColor: "#FF5500",
  },
  {
    name: "Spotify",
    href: "https://open.spotify.com/artist/2UMKCxDFAAy154VgUJHKN9",
    iconName: "SiSpotify",
    brandColor: "#1DB954",
  },
  {
    name: "Apple Music",
    href: "https://music.apple.com/us/artist/juntaro/1020632340",
    iconName: "SiApple",
    // SiApple 로고는 무채색이라 Apple Music 시그니처 레드로 점등.
    brandColor: "#FA243C",
  },
  {
    name: "Beatport",
    href: "https://www.beatport.com/artist/juntaro/501402",
    iconName: "SiBeatport",
    // 네온 그린(#01FF95)은 흰 배경 대비가 약해 딥 그린으로 조정.
    brandColor: "#00B37E",
  },
];
