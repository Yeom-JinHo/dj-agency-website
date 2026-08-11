export type ReleasePlatform =
  | "beatport"
  | "spotify"
  | "appleMusic"
  | "soundcloud"
  | "youtubeMusic";

export interface Release {
  /** 사이트 내 유니크(도메인 Release.slug) — 목록 렌더의 React key로 쓴다. */
  slug: string;
  title: string;
  artist: string;
  label?: string;
  // CMS 전환 후 Supabase Storage 공개 URL을 사용한다(@repo/content/media mediaUrl).
  // 원격 호스트는 @repo/next-config의 images.remotePatterns로 허용됨 — 와일드카드가 아니라
  // 자사 프로젝트 호스트(NEXT_PUBLIC_SUPABASE_URL 파생) + /storage/v1/object/public/media/** 경로로 고정.
  artwork?: string;
  /** blurDataURL(placeholder). CMS가 업로드 시 생성 — 없으면 blur 생략. */
  artworkPlaceholder?: string;
  // 값이 있는 플랫폼만 모달에 노출됩니다.
  links: Partial<Record<ReleasePlatform, string>>;
}
