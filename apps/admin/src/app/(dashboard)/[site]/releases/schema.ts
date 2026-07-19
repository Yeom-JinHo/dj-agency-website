import { z } from "zod";
import {
  socialSchema,
  PLATFORM_LINK_KEYS,
  type PlatformLinks,
  type Social,
} from "@repo/content/schema";

import { nullify, normalizeSocials } from "@/lib/form-normalize";

/** 빈 값은 허용하되, 값이 있으면 URL 형식을 강제(platform_links/socials와 동일 rigor). */
const urlOrEmpty = z.string().refine(
  (v) => v === "" || z.string().url().safeParse(v).success,
  { message: "Enter a valid URL" },
);

/** platform_links 폼 표현: 5개 확정 키 모두 문자열(빈 값 허용). */
const platformLinksFormSchema = z.object(
  Object.fromEntries(PLATFORM_LINK_KEYS.map((k) => [k, urlOrEmpty])) as Record<
    (typeof PLATFORM_LINK_KEYS)[number],
    typeof urlOrEmpty
  >,
);

/**
 * Release 편집 폼 값. content의 원자 스키마(socialSchema/platformLinksSchema)를
 * 재사용해 검증을 사이트 렌더와 공유한다. DB Row(releaseSchema)와 달리 폼은 문자열 기반
 * (nullable 대신 "")이고 id/timestamps/artwork_path/slug를 제외한다 —
 * slug는 title에서 서버가 생성(§13 불변), 이미지는 File로 별도 전송(§4.4).
 * 소속 모델(§8): site_slug는 라우트에서 결정하므로 폼 밖에 두고, 사이트 내 노출 순서만
 * sortOrder 숫자 필드로 받는다. featuredArtists는 콤마 구분 텍스트 1필드로 받고 서버
 * 변환에서 text[]로 분해한다.
 */
export const releaseFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  // "" = 없음. 로스터 select에서 선택, 서버 변환에서 null로.
  primaryArtistId: z.string(),
  artistCredit: z.string(),
  featuredArtists: z.string(),
  label: z.string(),
  catalogNo: z.string(),
  releaseDate: z.string(),
  shortDescriptionEn: z.string(),
  shortDescriptionKo: z.string(),
  fullDescriptionEn: z.string(),
  fullDescriptionKo: z.string(),
  platformLinks: platformLinksFormSchema,
  socials: z.array(socialSchema),
  // 사이트 내 노출 순서(작을수록 먼저). site_slug는 라우트 param에서 자동 지정.
  sortOrder: z.number().int().min(0),
});

export type ReleaseFormValues = z.infer<typeof releaseFormSchema>;

/** 생성 폼 초기값. */
export const emptyReleaseFormValues: ReleaseFormValues = {
  title: "",
  primaryArtistId: "",
  artistCredit: "",
  featuredArtists: "",
  label: "",
  catalogNo: "",
  releaseDate: "",
  shortDescriptionEn: "",
  shortDescriptionKo: "",
  fullDescriptionEn: "",
  fullDescriptionKo: "",
  platformLinks: Object.fromEntries(
    PLATFORM_LINK_KEYS.map((k) => [k, ""]),
  ) as Record<(typeof PLATFORM_LINK_KEYS)[number], string>,
  socials: [],
  sortOrder: 0,
};

/** 콤마 구분 텍스트 → text[] (빈 항목 제거) — release 전용. */
function normalizeFeaturedArtists(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** 빈 값 키를 제외한 platform_links jsonb 조립 — release 전용. */
function normalizePlatformLinks(
  links: ReleaseFormValues["platformLinks"],
): PlatformLinks {
  const out: PlatformLinks = {};
  for (const key of PLATFORM_LINK_KEYS) {
    const url = links[key].trim();
    if (url) out[key] = url;
  }
  return out;
}

export interface ReleaseDbInput {
  columns: {
    title: string;
    primary_artist_id: string | null;
    artist_credit: string | null;
    featured_artists: string[];
    label: string | null;
    catalog_no: string | null;
    release_date: string | null;
    short_description_en: string | null;
    short_description_ko: string | null;
    full_description_en: string | null;
    full_description_ko: string | null;
    platform_links: PlatformLinks;
    socials: Social[];
    sort_order: number;
  };
}

/** 검증된 폼 값 → DB 컬럼(이미지/slug/site_slug 제외 — 액션에서 처리). */
export function formValuesToDbInput(values: ReleaseFormValues): ReleaseDbInput {
  return {
    columns: {
      title: values.title.trim(),
      primary_artist_id: values.primaryArtistId || null,
      artist_credit: nullify(values.artistCredit),
      featured_artists: normalizeFeaturedArtists(values.featuredArtists),
      label: nullify(values.label),
      catalog_no: nullify(values.catalogNo),
      release_date: nullify(values.releaseDate),
      short_description_en: nullify(values.shortDescriptionEn),
      short_description_ko: nullify(values.shortDescriptionKo),
      full_description_en: nullify(values.fullDescriptionEn),
      full_description_ko: nullify(values.fullDescriptionKo),
      platform_links: normalizePlatformLinks(values.platformLinks),
      socials: normalizeSocials(values.socials),
      sort_order: values.sortOrder,
    },
  };
}
