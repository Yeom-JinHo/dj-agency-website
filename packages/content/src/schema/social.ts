import { z } from "zod";

/**
 * socials 입력은 플랫폼 enum 선택식. 데이터는 `[{ platform, url, label? }]`로 저장하고
 * 아이콘은 소비 측 코드에서 매핑한다(라이브러리 종속 iconName 문자열 미저장).
 */
export const SOCIAL_PLATFORMS = [
  "instagram",
  "youtube",
  "soundcloud",
  "spotify",
  "beatport",
  "appleMusic",
  "youtubeMusic",
  "bandcamp",
  "tiktok",
  "x",
  "website",
] as const;

export const socialPlatformSchema = z.enum(SOCIAL_PLATFORMS);
export type SocialPlatform = z.infer<typeof socialPlatformSchema>;

export const socialSchema = z.object({
  platform: socialPlatformSchema,
  url: z.string().url(),
  label: z.string().optional(),
});
export type Social = z.infer<typeof socialSchema>;
