import type { Social } from "@repo/content/schema";

/**
 * 폼 값 정규화(Artist/Release/Tour 공용). 순수 함수 — 클라이언트/서버 어디서나 안전.
 */

/** 빈/공백 문자열 → null (DB에는 null로 저장). */
export function nullify(value: string): string | null {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** label이 빈 문자열이면 제거(선택 필드) — jsonb에 label:"" 미저장. */
export function normalizeSocials(socials: Social[]): Social[] {
  return socials.map((s) => {
    const label = s.label?.trim();
    return label
      ? { platform: s.platform, url: s.url, label }
      : { platform: s.platform, url: s.url };
  });
}
