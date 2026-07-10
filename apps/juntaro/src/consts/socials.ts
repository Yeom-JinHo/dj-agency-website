import type { IconName } from "@repo/ui/common/Icon";

export type Social = {
  name: string;
  href: string;
  iconName: IconName;
};

/** Single source of truth for Juntaro's SNS links (mirrors VFL source.ts). */
export const SOCIALS: Social[] = [
  {
    name: "YouTube",
    href: "https://www.youtube.com/watch?v=1lAXNqA25Bs",
    iconName: "SiYoutube",
  },
  {
    name: "SoundCloud",
    href: "https://soundcloud.com/juntaromusic",
    iconName: "SiSoundcloud",
  },
  {
    name: "Spotify",
    href: "https://open.spotify.com/artist/2UMKCxDFAAy154VgUJHKN9",
    iconName: "SiSpotify",
  },
  {
    name: "Apple Music",
    href: "https://music.apple.com/us/artist/juntaro/1020632340",
    iconName: "SiApple",
  },
  {
    name: "Beatport",
    href: "https://www.beatport.com/artist/juntaro/501402",
    iconName: "SiBeatport",
  },
];
