export interface Release {
  title: string;
  artist: string;
  label?: string;
  // 로컬 /public 경로만 사용 (예: "/images/release/1.webp").
  // 외부 CDN URL은 next-config의 images.remotePatterns 설정 전까지 런타임 에러가 납니다.
  artwork?: string;
  href: string; // Beatport/Spotify 등 외부 링크
  catalogNo?: string;
}
