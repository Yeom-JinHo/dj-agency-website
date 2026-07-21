import { createRevalidateHandler } from "@repo/content/revalidate";

// 방식 B on-demand revalidate 엔드포인트(§4.3). admin 저장 시 publish 헬퍼가
// x-revalidate-secret 헤더 + { tags }로 POST → 해당 태그 캐시만 무효화.
// 시크릿은 REVALIDATE_SECRET env(admin과 공유)로 검증.
export const POST = createRevalidateHandler();
