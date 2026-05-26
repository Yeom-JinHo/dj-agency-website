export type ReleasePlatform =
  | "beatport"
  | "spotify"
  | "appleMusic"
  | "soundcloud"
  | "youtubeMusic";

export interface Release {
  title: string;
  artist: string;
  label?: string;
  // 로컬 /public 경로만 사용 (예: "/images/release/1.webp").
  // 외부 CDN URL은 next-config의 images.remotePatterns 설정 전까지 런타임 에러가 납니다.
  artwork?: string;
  catalogNo?: string;
  // 값이 있는 플랫폼만 모달에 노출됩니다.
  links: Partial<Record<ReleasePlatform, string>>;
}
