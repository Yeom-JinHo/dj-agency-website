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

/**
 * 저장형 링크 공용 URL 스키마. socials/platform_links/ticket_url은 공개 사이트에서
 * href로 그대로 렌더되는데, zod `.url()`은 WHATWG 파서라 `javascript:` 같은 스크립트
 * 실행 스킴도 통과한다 — http(s)만 화이트리스트해 저장 단계에서 차단한다.
 */
export const httpUrlSchema = z
  .string()
  .url()
  .refine((u) => /^https?:\/\//i.test(u), "http(s) URL만 사용할 수 있습니다.");

export const socialSchema = z.object({
  platform: socialPlatformSchema,
  url: httpUrlSchema,
  label: z.string().optional(),
});
export type Social = z.infer<typeof socialSchema>;
