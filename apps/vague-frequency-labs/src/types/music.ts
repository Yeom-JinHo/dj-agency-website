import type { ArtistName } from "./artist";
import type { Socials } from "./contact";

export interface MusicInfo {
  name: string;
  artist: ArtistName;
  label?: string;
  image: string;
  /** blurDataURL(placeholder). CMS가 업로드 시 생성 — 없거나 비면 blur 생략.
   *  시드 참조용 source.ts 잔존 항목은 placeholder가 없어 optional. */
  imagePlaceholder?: string;
  shortDescription: string;
  fullDescription: string;
  socials?: Socials[];
}
