const MEDIA_BUCKET = "media";

/**
 * Storage `media` 버킷의 공개 read URL. 클라이언트/서버 어디서나 안전(순수 문자열 조합).
 * getPublicUrl 호출 없이 표준 공개 URL 포맷을 조립해 supabase 클라이언트 의존을 피한다.
 */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/storage/v1/object/public/${MEDIA_BUCKET}/${path}`;
}

/**
 * name → slug: 소문자·영숫자 외 문자를 하이픈으로, 연속/양끝 하이픈 정리.
 * slug는 생성 시 1회만 계산하고 이후 불변(cms-plan §13).
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
