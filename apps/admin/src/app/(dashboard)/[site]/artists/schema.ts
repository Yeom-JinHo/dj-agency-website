import { z } from "zod";
import {
  socialSchema,
  selectedWorkSchema,
  type SelectedWork,
  type Social,
} from "@repo/content/schema";

import { nullify, normalizeSocials } from "@/lib/form-normalize";

/**
 * Artist 편집 폼 값. content의 원자 스키마(socialSchema/selectedWorkSchema)를
 * 재사용해 검증을 사이트 렌더와 공유한다. DB Row(artistSchema)와 달리 폼은 문자열 기반
 * (nullable 대신 "")이고 id/timestamps/image_path/slug/site_slug를 제외한다 —
 * slug는 name에서 서버가 생성(§13 불변), site_slug는 라우트의 [site]로 자동 결정,
 * 이미지는 File로 별도 전송(§4.4). 정렬은 sortOrder 단일 숫자 필드.
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
  // 사이트 내 노출 순서(오름차순). 소속은 라우트의 site로 자동 — 사이트 선택 UI 없음.
  sortOrder: z.number().int().min(0),
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
  sortOrder: 0,
};

/** meta가 빈 문자열이면 제거(선택 필드) — artist 전용(§7 헬퍼 승격에서 잔류). */
function normalizeSelectedWorks(works: SelectedWork[]): SelectedWork[] {
  return works
    .filter((w) => w.title.trim().length > 0)
    .map((w) => {
      const meta = w.meta?.trim();
      return meta ? { title: w.title.trim(), meta } : { title: w.title.trim() };
    });
}

/** 검증된 폼 값 → DB 컬럼(이미지/slug/site_slug 제외 — 액션에서 처리). */
export interface ArtistDbColumns {
  name: string;
  nickname: string | null;
  short_description_en: string | null;
  short_description_ko: string | null;
  full_description_en: string | null;
  full_description_ko: string | null;
  city: string | null;
  selected_works: SelectedWork[];
  socials: Social[];
  sort_order: number;
}

export function formValuesToDbColumns(values: ArtistFormValues): ArtistDbColumns {
  return {
    name: values.name.trim(),
    nickname: nullify(values.nickname),
    short_description_en: nullify(values.shortDescriptionEn),
    short_description_ko: nullify(values.shortDescriptionKo),
    full_description_en: nullify(values.fullDescriptionEn),
    full_description_ko: nullify(values.fullDescriptionKo),
    city: nullify(values.city),
    selected_works: normalizeSelectedWorks(values.selectedWorks),
    socials: normalizeSocials(values.socials),
    sort_order: values.sortOrder,
  };
}
