import type { ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@repo/content/supabase/server";

import { NavLinks } from "@/components/nav-links";
import { SiteSwitcher } from "@/components/site-switcher";
import { Button } from "@/components/ui/button";

// 인증 세션(쿠키)에 의존하므로 정적 프리렌더 대상에서 제외한다 —
// 빌드 타임에 서버 클라이언트를 호출하지 않는다.
export const dynamic = "force-dynamic";

async function signOut() {
  "use server";
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function DashboardLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 인증(세션) 없으면 차단 — 미들웨어와 이중 방어.
  if (!user) {
    redirect("/login");
  }

  // 인가: editors 멤버십 확인(초대된 편집자만 접근). self-read RLS로 본인 행만 조회 가능.
  // NOTE(통합): editors 테이블 타입은 feat/admin-p1-content 마이그레이션에 추가 중이라
  // 아직 database.types에 없다. 반영되면 이 SupabaseClient 캐스팅을 제거하고
  // supabase.from("editors")를 직접 타입 지원받게 정리할 것.
  const { data: editor } = await (supabase as SupabaseClient)
    .from("editors")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!editor) {
    redirect("/login");
  }

  return (
    <div className="min-h-svh">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight whitespace-nowrap"
          >
            v.f.labs Admin
          </Link>
          <SiteSwitcher />
          <NavLinks />
        </div>
        <div className="flex items-center gap-3">
          {user.email ? (
            <span className="text-muted-foreground text-sm">{user.email}</span>
          ) : null}
          <form action={signOut}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
