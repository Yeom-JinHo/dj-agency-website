import "server-only";
import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { timingSafeEqual } from "node:crypto";
import { z } from "zod";

/** tags 배열 상한 — 방식 B 발행은 엔티티당 소수 태그만 보낸다(§4.3). 과대 배열 방어. */
const MAX_TAGS = 50;

const bodySchema = z.object({
  // 빈 배열은 무의미한 no-op 요청이라 거부, 태그당 길이 상한으로 거대 문자열 차단.
  tags: z.array(z.string().min(1).max(256)).min(1).max(MAX_TAGS),
});

const NO_STORE = { "Cache-Control": "no-store" } as const;

/**
 * 시크릿 상수시간 비교. 길이 불일치 시 timingSafeEqual가 throw하지 않도록
 * 동일 길이 더미 비교로 정규화해 길이 노출·예외를 함께 막는다.
 */
function secretMatches(provided: string | null, expected: string): boolean {
  if (!provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) {
    timingSafeEqual(b, b);
    return false;
  }
  return timingSafeEqual(a, b);
}

/**
 * 방식 B on-demand revalidate 라우트 핸들러 팩토리(§4.3/§7.5). 각 사이트
 * app/api/revalidate/route.ts가 이 POST 핸들러를 그대로 export한다. admin의
 * publish 헬퍼가 `x-revalidate-secret` 헤더 + `{ tags }` 본문으로 호출하며,
 * 시크릿 검증 후 태그별 revalidateTag로 해당 사이트 캐시만 무효화한다.
 */
export function createRevalidateHandler() {
  return async function POST(request: Request): Promise<Response> {
    const secret = process.env.REVALIDATE_SECRET;
    if (!secret) {
      // 시크릿 자체는 로그에 남기지 않는다.
      console.error("[revalidate] REVALIDATE_SECRET 미설정 — 발행 요청 거부");
      return NextResponse.json(
        { revalidated: false },
        { status: 500, headers: NO_STORE },
      );
    }

    if (!secretMatches(request.headers.get("x-revalidate-secret"), secret)) {
      // 불일치는 본문 없이 401 — 원인 노출 최소화.
      return new NextResponse(null, { status: 401, headers: NO_STORE });
    }

    let tags: string[];
    try {
      tags = bodySchema.parse(await request.json()).tags;
    } catch {
      return NextResponse.json(
        { revalidated: false, error: "Invalid body" },
        { status: 400, headers: NO_STORE },
      );
    }

    tags.forEach((tag) => revalidateTag(tag));

    return NextResponse.json(
      { revalidated: true, tags },
      { headers: NO_STORE },
    );
  };
}
