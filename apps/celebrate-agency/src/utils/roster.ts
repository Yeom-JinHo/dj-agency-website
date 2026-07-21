import { mediaUrl } from "@repo/content/media";
import { getArtists } from "@repo/content/queries";
import type {
  Artist as ContentArtist,
  SelectedWork,
  SocialPlatform,
} from "@repo/content/schema";

import type {
  Artist,
  ArtistSocial,
  ArtistSocialPlatform,
  ArtistWork,
} from "@/types/artist";

const SITE_SLUG = "celebrate-agency" as const;

/**
 * DB socials platform enum → 기존 roster 아이콘 키(types/artist).
 * 아이콘 테이블(ArtistModal SOCIAL_ICONS)에 없는 플랫폼은 범용 링크 아이콘("etc")으로 흡수한다.
 */
const PLATFORM_TO_ROSTER: Record<SocialPlatform, ArtistSocialPlatform> = {
  instagram: "instagram",
  youtube: "youtube",
  soundcloud: "soundcloud",
  spotify: "spotify",
  x: "x",
  beatport: "etc",
  appleMusic: "etc",
  youtubeMusic: "etc",
  bandcamp: "etc",
  tiktok: "etc",
  website: "etc",
};

/**
 * bio 파리티: 시드가 en/ko 분리 저장 → 기존 단일 문자열 렌더로 복원.
 * 둘 다 있으면 빈 줄로 결합, 하나면 그것만, 둘 다 없으면 빈 문자열.
 */
function toBio(en: string | null, ko: string | null): string {
  return [en, ko]
    .filter((v): v is string => !!v && v.trim().length > 0)
    .join("\n\n");
}

/**
 * selected_works jsonb {title, meta?} → 기존 UI {id, title, meta}.
 * 시드가 원본 id 라벨을 폐기했으므로 순번(A01…)으로 재생성하되,
 * coming-soon placeholder(meta "—")는 원본과 동일하게 "—" 라벨을 유지한다.
 */
function toWork(work: SelectedWork, index: number): ArtistWork {
  const isPlaceholder = work.meta === "—";
  return {
    id: isPlaceholder ? "—" : `A${String(index + 1).padStart(2, "0")}`,
    title: work.title,
    meta: work.meta ?? "",
  };
}

function toArtist(a: ContentArtist): Artist {
  const socials: ArtistSocial[] = a.socials.map((s) => ({
    platform: PLATFORM_TO_ROSTER[s.platform],
    url: s.url,
    ...(s.label ? { label: s.label } : {}),
  }));
  return {
    id: a.slug,
    name: a.name,
    image: mediaUrl(a.imagePath) ?? undefined,
    bio: toBio(a.fullDescriptionEn, a.fullDescriptionKo),
    city: a.city ?? "",
    selectedWorks: a.selectedWorks.map(toWork),
    socials,
  };
}

/** roster 소비용: DB 아티스트(소스 순서=sort_order)를 기존 roster Artist 형태로 어댑트. */
export async function getRosterArtists(): Promise<Artist[]> {
  const artists = await getArtists(SITE_SLUG);
  return artists.map(toArtist);
}
