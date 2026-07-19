import { z } from "zod";
import { socialSchema } from "./social";
import { siteSlugSchema } from "./site";

/** celebrate roster의 selected works 항목. */
export const selectedWorkSchema = z.object({
  title: z.string(),
  meta: z.string().optional(),
});
export type SelectedWork = z.infer<typeof selectedWorkSchema>;

/**
 * 사이트 소속 아티스트(site_slug FK). 설명은 en/ko 분리(i18n-ready),
 * `city`/`selectedWorks`는 celebrate roster용(다른 사이트는 비움).
 * slug는 사이트 내 유니크, 정렬은 `sortOrder`.
 */
export const artistSchema = z.object({
  id: z.string().uuid(),
  siteSlug: siteSlugSchema,
  slug: z.string(),
  name: z.string(),
  nickname: z.string().nullable(),
  shortDescriptionEn: z.string().nullable(),
  shortDescriptionKo: z.string().nullable(),
  fullDescriptionEn: z.string().nullable(),
  fullDescriptionKo: z.string().nullable(),
  imagePath: z.string().nullable(),
  logoImagePath: z.string().nullable(),
  imagePlaceholder: z.string().nullable(),
  city: z.string().nullable(),
  selectedWorks: z.array(selectedWorkSchema),
  socials: z.array(socialSchema),
  sortOrder: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Artist = z.infer<typeof artistSchema>;
