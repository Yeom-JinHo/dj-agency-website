import type { ARTIST_NAME } from "@/consts/artist";

import type { Socials } from "./contact";

export interface ArtistProfile {
  /** 라우트 키(사이트 내 유니크·불변). 링크·canonical은 name이 아니라 slug로 만든다. */
  slug: string;
  name: ArtistName;
  image: string;
  imagePlaceholder: string;
  logoImage: string;
  nickname: ArtistName;
  shortDescription: string;
  fullDescription: string;
  socials?: Socials[];
}

export type ArtistName = (typeof ARTIST_NAME)[keyof typeof ARTIST_NAME];
