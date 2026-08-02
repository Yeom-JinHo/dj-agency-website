/**
 * 업로드 이미지 제한. 서버 검증(entity-media)과 클라이언트 사전 검증(ImageField)이
 * 같은 값을 봐야 하는데 entity-media는 server-only라 상수만 여기로 분리한다.
 */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

export const ALLOWED_IMAGE_MIME = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/avif",
] as const;

/** 헬프 텍스트·에러 문구용 표기(PNG·JPEG·…) — 허용 목록에서 파생. */
export const ALLOWED_IMAGE_LABEL = ALLOWED_IMAGE_MIME.map((mime) =>
  mime.replace("image/", "").toUpperCase(),
).join("·");

export const MAX_UPLOAD_MB = MAX_UPLOAD_BYTES / 1024 / 1024;
