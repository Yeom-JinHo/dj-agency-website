export type ReleasePlatform =
  | "beatport"
  | "spotify"
  | "appleMusic"
  | "soundcloud"
  | "youtubeMusic";

import type { StaticImageData } from "next/image";

export interface Release {
  title: string;
  artist: string;
  label?: string;
  // public의 파일을 정적 import로 지정 — 빌드가 치수·blur placeholder를 자동 생성.
  // 없는 파일을 참조하면 빌드 에러로 즉시 발각됩니다.
  artwork?: StaticImageData;
  catalogNo?: string;
  // 값이 있는 플랫폼만 모달에 노출됩니다.
  links: Partial<Record<ReleasePlatform, string>>;
}
