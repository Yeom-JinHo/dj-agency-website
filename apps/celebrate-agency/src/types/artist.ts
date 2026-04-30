export type ArtistSocialPlatform =
  | "instagram"
  | "spotify"
  | "youtube"
  | "x"
  | "soundcloud"
  | "etc";

export interface ArtistSocial {
  platform: ArtistSocialPlatform;
  url: string;
  label?: string;
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  bio: string;
  socials: ArtistSocial[];
}
