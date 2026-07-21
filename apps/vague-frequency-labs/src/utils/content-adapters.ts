import type { Artist, Release, SocialPlatform } from "@repo/content/schema";
import { mediaUrl } from "@repo/content/media";
import type { IconName } from "@repo/ui/common/Icon";

import type { ArtistName, ArtistProfile } from "@/types/artist";
import type { MusicInfo } from "@/types/music";
import type { Socials } from "@/types/contact";

/** 이 앱이 소비하는 콘텐츠 사이트 슬러그. */
export const VFL_SITE = "vague-frequency-labs" as const;

/**
 * SocialPlatform enum → 표시명 + 아이콘. DB는 라이브러리 종속 iconName을 저장하지 않으므로
 * (schema/social.ts 참조) 소비 측인 이곳에서 아이콘을 매핑한다. 아이콘이 없는 플랫폼은
 * name만 노출(소비 컴포넌트가 `iconName &&`로 가드).
 */
const PLATFORM_META: Record<
  SocialPlatform,
  { name: string; iconName?: IconName }
> = {
  youtube: { name: "Youtube", iconName: "SiYoutube" },
  instagram: { name: "Instagram", iconName: "SiInstagram" },
  soundcloud: { name: "SoundCloud", iconName: "SiSoundcloud" },
  spotify: { name: "Spotify", iconName: "SiSpotify" },
  beatport: { name: "Beatport", iconName: "SiBeatport" },
  appleMusic: { name: "Apple Music", iconName: "SiApple" },
  youtubeMusic: { name: "Youtube Music", iconName: "SiYoutube" },
  bandcamp: { name: "Bandcamp" },
  tiktok: { name: "TikTok" },
  x: { name: "X", iconName: "SiX" },
  website: { name: "Website" },
};

/**
 * 릴리즈 소셜의 표시 순서. 시드가 원본 단일 socials 배열을 platform_links(스트리밍 5키)와
 * socials(그 외)로 분해하며 순서를 잃으므로, 여기서 원본 라이브 순서(Youtube→SoundCloud→
 * Spotify→Apple Music→Beatport)를 재현하는 정준 순서로 다시 정렬한다.
 */
const RELEASE_SOCIAL_ORDER: SocialPlatform[] = [
  "youtube",
  "soundcloud",
  "spotify",
  "appleMusic",
  "beatport",
  "youtubeMusic",
  "instagram",
  "x",
  "bandcamp",
  "tiktok",
  "website",
];

function toSocial(platform: SocialPlatform, href: string): Socials {
  const meta = PLATFORM_META[platform];
  return { name: meta.name, href, iconName: meta.iconName };
}

/**
 * en/ko 설명을 라이브 파리티로 결합한다: 둘 다 있으면 빈 줄로 이어붙이고(en + "\n\n" + ko),
 * 하나만 있으면 그것만. 원본은 EN·KO 혼합 단일 문자열이었고 시드가 en/ko로 분리했다.
 */
function combineDescription(
  en: string | null,
  ko: string | null,
): string {
  if (en && ko) return `${en}\n\n${ko}`;
  return en ?? ko ?? "";
}

/** 도메인 Artist → 기존 ArtistProfile props. 이미지는 mediaUrl로 Storage 공개 URL 조립. */
export function toArtistProfile(artist: Artist): ArtistProfile {
  return {
    name: artist.name as ArtistName,
    image: mediaUrl(artist.imagePath) ?? "",
    imagePlaceholder: artist.imagePlaceholder ?? "",
    logoImage: mediaUrl(artist.logoImagePath) ?? "",
    nickname: (artist.nickname ?? artist.name) as ArtistName,
    shortDescription:
      artist.shortDescriptionEn ?? artist.shortDescriptionKo ?? "",
    fullDescription: combineDescription(
      artist.fullDescriptionEn,
      artist.fullDescriptionKo,
    ),
    socials: artist.socials.map((s) => toSocial(s.platform, s.url)),
  };
}

/** 도메인 Release → 기존 MusicInfo props. platform_links + socials를 정준 순서로 재병합. */
export function toMusicInfo(release: Release): MusicInfo {
  const urls = new Map<SocialPlatform, string>();
  for (const s of release.socials) urls.set(s.platform, s.url);
  for (const [key, url] of Object.entries(release.platformLinks)) {
    if (url) urls.set(key as SocialPlatform, url);
  }
  const socials = RELEASE_SOCIAL_ORDER.filter((p) => urls.has(p)).map((p) =>
    toSocial(p, urls.get(p)!),
  );

  return {
    name: release.title,
    artist: (release.artistCredit ?? "") as ArtistName,
    label: release.label ?? undefined,
    image: mediaUrl(release.artworkPath) ?? "",
    shortDescription:
      release.shortDescriptionEn ?? release.shortDescriptionKo ?? "",
    fullDescription: combineDescription(
      release.fullDescriptionEn,
      release.fullDescriptionKo,
    ),
    socials,
  };
}
