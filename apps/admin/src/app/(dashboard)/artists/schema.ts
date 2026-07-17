import { z } from "zod";
import {
  siteSlugSchema,
  socialSchema,
  selectedWorkSchema,
  type SelectedWork,
  type Social,
  type SiteSlug,
} from "@repo/content/schema";

/**
 * Artist 편집 폼 값. content의 원자 스키마(socialSchema/selectedWorkSchema/siteSlugSchema)를
 * 재사용해 검증을 사이트 렌더와 공유한다. DB Row(artistSchema)와 달리 폼은 문자열 기반
 * (nullable 대신 "")이고 id/timestamps/image_path/slug를 제외한다 —
 * slug는 name에서 서버가 생성(§13 불변), 이미지는 File로 별도 전송(§4.4).
 * 이 스키마 하나를 client RHF resolver와 server 재검증이 공유한다.
 */
export const artistFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  nickname: z.string(),
  shortDescriptionEn: z.string(),
  shortDescriptionKo: z.string(),
  fullDescriptionEn: z.string(),
  fullDescriptionKo: z.string(),
  city: z.string(),
  socials: z.array(socialSchema),
  selectedWorks: z.array(selectedWorkSchema),
  // 체크된 사이트만 담긴다. 각 항목의 sortOrder는 사이트별 노출 순서(조인 테이블).
  sites: z.array(
    z.object({
      siteSlug: siteSlugSchema,
      sortOrder: z.number().int().min(0),
    }),
  ),
});

export type ArtistFormValues = z.infer<typeof artistFormSchema>;

/** 생성 폼 초기값. */
export const emptyArtistFormValues: ArtistFormValues = {
  name: "",
  nickname: "",
  shortDescriptionEn: "",
  shortDescriptionKo: "",
  fullDescriptionEn: "",
  fullDescriptionKo: "",
  city: "",
  socials: [],
  selectedWorks: [],
  sites: [],
};

/** 빈/공백 문자열 → null (DB에는 null로 저장). */
function nullify(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** meta가 빈 문자열이면 제거(선택 필드). */
function normalizeSelectedWorks(works: SelectedWork[]): SelectedWork[] {
  return works
    .filter((w) => w.title.trim().length > 0)
    .map((w) => {
      const meta = w.meta?.trim();
      return meta ? { title: w.title.trim(), meta } : { title: w.title.trim() };
    });
}

/** label이 빈 문자열이면 제거(선택 필드) — jsonb에 label:"" 미저장. */
function normalizeSocials(socials: Social[]): Social[] {
  return socials.map((s) => {
    const label = s.label?.trim();
    return label
      ? { platform: s.platform, url: s.url, label }
      : { platform: s.platform, url: s.url };
  });
}

export interface ArtistDbInput {
  columns: {
    name: string;
    nickname: string | null;
    short_description_en: string | null;
    short_description_ko: string | null;
    full_description_en: string | null;
    full_description_ko: string | null;
    city: string | null;
    selected_works: SelectedWork[];
    socials: Social[];
  };
  sites: { siteSlug: SiteSlug; sortOrder: number }[];
}

/** 검증된 폼 값 → DB 컬럼 + sites 배열(이미지/slug 제외 — 액션에서 처리). */
export function formValuesToDbInput(values: ArtistFormValues): ArtistDbInput {
  return {
    columns: {
      name: values.name.trim(),
      nickname: nullify(values.nickname),
      short_description_en: nullify(values.shortDescriptionEn),
      short_description_ko: nullify(values.shortDescriptionKo),
      full_description_en: nullify(values.fullDescriptionEn),
      full_description_ko: nullify(values.fullDescriptionKo),
      city: nullify(values.city),
      selected_works: normalizeSelectedWorks(values.selectedWorks),
      socials: normalizeSocials(values.socials),
    },
    sites: values.sites,
  };
}
