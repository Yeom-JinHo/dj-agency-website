import { z } from "zod";

/** 콘텐츠가 노출될 수 있는 4개 사이트. DB `sites` 테이블과 1:1. */
export const SITE_SLUGS = [
  "vague-frequency-labs",
  "payday-records",
  "celebrate-agency",
  "juntaro",
] as const;

export const siteSlugSchema = z.enum(SITE_SLUGS);
export type SiteSlug = (typeof SITE_SLUGS)[number];
