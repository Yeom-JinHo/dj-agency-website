import type { Credit, Platform, PlatformName } from "@/types/credit";

// 플랫폼별 아이콘 + 실제 브랜드 컬러 매핑 (신뢰도 신호)
const platforms: Record<PlatformName, Platform> = {
  SoundCloud: {
    name: "SoundCloud",
    iconName: "SiSoundcloud",
    brandColor: "#FF5500",
  },
  YouTube: {
    name: "YouTube",
    iconName: "SiYoutube",
    brandColor: "#FF0000",
  },
  Instagram: {
    name: "Instagram",
    iconName: "SiInstagram",
    brandColor: "#E4405F",
  },
  Mixcloud: {
    name: "Mixcloud",
    iconName: "SiMixcloud",
    brandColor: "#5000FF",
  },
};

// 운영자가 직접 큐레이션하는 크레딧 목록. 최신순(날짜 내림차순)으로 둔다.
const credits: Credit[] = [
  {
    artist: "Kota Yamamoto",
    platform: "Mixcloud",
    date: "Mar 2025",
    url: "https://www.mixcloud.com/",
    note: "Mixcloud set",
  },
  {
    artist: "Lena Brandt",
    platform: "SoundCloud",
    date: "Feb 2025",
    url: "https://soundcloud.com/",
    note: "Radio show",
  },
  {
    artist: "Marcus Ueda",
    platform: "YouTube",
    date: "Jan 2025",
    url: "https://www.youtube.com/",
    note: "Live clip",
  },
  {
    artist: "Sofia Reyes",
    platform: "Instagram",
    date: "Dec 2024",
    url: "https://www.instagram.com/",
  },
];

export { credits, platforms };
