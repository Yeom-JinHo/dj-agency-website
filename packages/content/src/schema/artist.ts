import { z } from "zod";
import { socialSchema } from "./social";

/** celebrate roster의 selected works 항목. */
export const selectedWorkSchema = z.object({
  title: z.string(),
  meta: z.string().optional(),
});
export type SelectedWork = z.infer<typeof selectedWorkSchema>;

/**
 * 사이트 간 공유되는 아티스트. 설명은 en/ko 분리(i18n-ready),
 * `city`/`selectedWorks`는 celebrate roster용(다른 사이트는 비움).
 */
export const artistSchema = z.object({
  id: z.string().uuid(),
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
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Artist = z.infer<typeof artistSchema>;
