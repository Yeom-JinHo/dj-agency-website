import { z } from "zod";
import { socialSchema } from "./social";

/** platform_links는 5개 확정 키. jsonb라 필요 시 추가 용이. */
export const PLATFORM_LINK_KEYS = [
  "beatport",
  "spotify",
  "appleMusic",
  "soundcloud",
  "youtubeMusic",
] as const;

export const platformLinksSchema = z.object({
  beatport: z.string().url().optional(),
  spotify: z.string().url().optional(),
  appleMusic: z.string().url().optional(),
  soundcloud: z.string().url().optional(),
  youtubeMusic: z.string().url().optional(),
});
export type PlatformLinks = z.infer<typeof platformLinksSchema>;

/**
 * 음원. 콜라보는 v1에서 `primaryArtistId` + `featuredArtists text[]`.
 * `artistCredit`은 로스터 밖 외부 아티스트 표시용.
 */
export const releaseSchema = z.object({
  id: z.string().uuid(),
  slug: z.string(),
  title: z.string(),
  primaryArtistId: z.string().uuid().nullable(),
  artistCredit: z.string().nullable(),
  featuredArtists: z.array(z.string()),
  label: z.string().nullable(),
  catalogNo: z.string().nullable(),
  artworkPath: z.string().nullable(),
  artworkPlaceholder: z.string().nullable(),
  shortDescriptionEn: z.string().nullable(),
  shortDescriptionKo: z.string().nullable(),
  fullDescriptionEn: z.string().nullable(),
  fullDescriptionKo: z.string().nullable(),
  releaseDate: z.string().nullable(),
  platformLinks: platformLinksSchema,
  socials: z.array(socialSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Release = z.infer<typeof releaseSchema>;
