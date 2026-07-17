import type { StaticImageData } from "next/image";

import type { ArtistName } from "./artist";
import type { Socials } from "./contact";

export interface MusicInfo {
  name: string;
  artist: ArtistName;
  label?: string;
  image: StaticImageData;
  shortDescription: string;
  fullDescription: string;
  socials?: Socials[];
}
