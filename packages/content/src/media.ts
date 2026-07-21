const MEDIA_BUCKET = "media";

/**
 * Storage `media` 버킷의 공개 read URL. 클라이언트/서버 어디서나 안전(순수 문자열 조합).
 * getPublicUrl 호출 없이 표준 공개 URL 포맷을 조립해 supabase 클라이언트 의존을 피한다.
 * (admin lib/media.ts의 mediaUrl을 사이트 공용으로 승격 — P3b에서 4개 사이트가 소비.)
 */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}
