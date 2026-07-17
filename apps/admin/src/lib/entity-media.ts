import "server-only";
import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { toWebp } from "@repo/content/image";
import type { Database } from "@repo/content/supabase/types";

/**
 * Admin 전용 이미지 쓰기 헬퍼(Artist/Release/Tour 공용). 서버 전용 —
 * toWebp(sharp)·node:crypto를 쓰므로 클라이언트 번들 유입 금지(§7.1 경계:
 * @repo/content에는 두지 않는 admin 쓰기 경로).
 */

const MEDIA_BUCKET = "media";
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 원본 8MB 상한
const ALLOWED_MIME = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
]);

type Supabase = SupabaseClient<Database>;

/** FormData에서 유효한 이미지 파일만 추출(빈 input은 size 0). */
export function imageFile(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

/**
 * toWebp/업로드 전 값싼 게이트: MIME 화이트리스트 + 원본 크기 상한.
 * insert-first 흐름에서 행 생성 전에 호출해 불량 입력이 행을 만들지 않게 한다.
 */
export function validateImageFile(file: File): void {
  if (!ALLOWED_MIME.has(file.type)) {
    throw new Error(
      `지원하지 않는 이미지 형식입니다(${file.type || "unknown"}). PNG·JPEG·WEBP·AVIF만 업로드할 수 있습니다.`,
    );
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `이미지가 너무 큽니다(${(file.size / 1024 / 1024).toFixed(1)}MB). 8MB 이하만 업로드할 수 있습니다.`,
    );
  }
}

/**
 * 파일 → toWebp → Storage 업로드. 경로에 콘텐츠 해시로 캐시버스팅:
 * `{entity}/{slug}/{kind}-{hash8}.webp`. entity/kind는 호출 측이 지정
 * (artist·release·tour / profile·logo·artwork·poster).
 */
export async function uploadEntityImage(
  supabase: Supabase,
  entity: string,
  slug: string,
  kind: string,
  file: File,
): Promise<{ path: string; placeholder: string }> {
  validateImageFile(file);
  const bytes = Buffer.from(await file.arrayBuffer());
  const { webp, placeholder } = await toWebp(bytes);
  const hash = createHash("sha256").update(webp).digest("hex").slice(0, 8);
  const path = `${entity}/${slug}/${kind}-${hash}.webp`;
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, webp, { contentType: "image/webp", upsert: true });
  if (error) {
    throw new Error(`이미지 업로드 실패(${kind}): ${error.message}`);
  }
  return { path, placeholder };
}

/** best-effort Storage 삭제(고아 정리는 §12 향후 — 실패는 무시). 빈 경로는 스킵. */
export async function removeImages(
  supabase: Supabase,
  paths: (string | null | undefined)[],
): Promise<void> {
  const targets = paths.filter((p): p is string => Boolean(p));
  if (targets.length === 0) return;
  await supabase.storage
    .from(MEDIA_BUCKET)
    .remove(targets)
    .catch(() => undefined);
}
