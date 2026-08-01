export type ArtistSocialPlatform =
  | "instagram"
  | "spotify"
  | "youtube"
  | "x"
  | "soundcloud"
  | "beatport"
  | "appleMusic"
  | "youtubeMusic"
  | "bandcamp"
  | "tiktok"
  | "etc";

export interface ArtistSocial {
  platform: ArtistSocialPlatform;
  url: string;
  label?: string;
}

export interface ArtistWork {
  id: string;
  title: string;
  meta: string;
}

export interface Artist {
  id: string;
  name: string;
  image?: string;
  /** blurDataURL(placeholder). CMS가 업로드 시 생성 — 없으면 blur 생략. */
  imagePlaceholder?: string;
  bio: string;
  city: string;
  selectedWorks: ArtistWork[];
  socials: ArtistSocial[];
}
