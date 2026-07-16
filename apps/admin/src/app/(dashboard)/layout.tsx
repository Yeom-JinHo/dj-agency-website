import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@repo/content/supabase/server";

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

  return (
    <div className="min-h-svh">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <span className="text-sm font-semibold tracking-tight">
          v.f.labs Admin
        </span>
        <div className="flex items-center gap-3">
          {user?.email ? (
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
