import { NextResponse } from "next/server";
import { createAnonClient } from "@repo/content/supabase/anon";

// Supabase 무료 티어는 7일 API 비활성 시 프로젝트를 pause한다(cms-plan §3).
// Vercel Cron이 하루 1회 이 route를 호출해 초경량 조회로 7일 윈도우를 리셋한다.
// 정적 평가에서 anon 클라이언트를 호출하지 않도록 동적으로 강제한다.
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createAnonClient();
  const { error } = await supabase.from("sites").select("slug").limit(1);

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
