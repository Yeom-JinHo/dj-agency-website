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
  // CMS 전환 후 Supabase Storage 공개 URL을 사용한다(@repo/content/media mediaUrl).
  // 원격 호스트는 @repo/next-config의 images.remotePatterns(**.supabase.co)로 허용됨.
  artwork?: string;
  catalogNo?: string;
  // 값이 있는 플랫폼만 모달에 노출됩니다.
  links: Partial<Record<ReleasePlatform, string>>;
}
