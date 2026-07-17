import { NextResponse } from "next/server";
import { createAnonClient } from "@repo/content/supabase/anon";

// Supabase 무료 티어는 7일 API 비활성 시 프로젝트를 pause한다(cms-plan §3).
// Vercel Cron이 하루 1회 이 route를 호출해 초경량 조회로 7일 윈도우를 리셋한다.
// 정적 평가에서 anon 클라이언트를 호출하지 않도록 동적으로 강제한다.
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store" } as const;

export async function GET(request: Request) {
  // Vercel Cron은 CRON_SECRET 설정 시 `Authorization: Bearer <secret>`을 자동 첨부한다.
  // 외부에서 직접 호출해 함수 실행을 유발하는 것을 차단한다.
  if (
    request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse(null, { status: 401, headers: NO_STORE });
  }

  const supabase = createAnonClient();
  const { error } = await supabase.from("sites").select("slug").limit(1);

  if (error) {
    // 내부 오류 상세는 응답에 노출하지 않고 서버 로그로만 남긴다.
    console.error("[keepalive] query failed:", error.message);
    return NextResponse.json({ ok: false }, { status: 500, headers: NO_STORE });
  }

  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
