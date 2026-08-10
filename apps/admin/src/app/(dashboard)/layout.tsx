import type { ReactNode } from "react";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@repo/content/supabase/server";

import adminLogo from "@/assets/admin-logo.webp";
import { GuardedLink } from "@/components/guarded-link";
import { SignOutButton } from "@/components/sign-out-button";
import { getAdminSession } from "@/lib/auth";

// 인증 세션(쿠키)에 의존하므로 정적 프리렌더 대상에서 제외한다 —
// 빌드 타임에 서버 클라이언트를 호출하지 않는다.
// 하위 (dashboard)/** 전체가 이 레이아웃을 거치므로, 각 page.tsx의 개별 선언은 제거했다 — 이 선언 하나가 트리 전체를 커버한다.
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
  // 인증(세션) + 인가(editors 멤버십)를 한 번에 — 미들웨어와 이중 방어.
  // 사이트 단위 권한(allowedSites)은 이 아래 화면들이 lib/auth에서 직접 읽는다
  // (요청당 캐시되므로 중복 조회가 아니다): 대시보드는 카드 목록을 거기서 만들고,
  // [site]/layout.tsx는 미부여 사이트를 notFound()로 끊는다.
  const session = await getAdminSession();
  if (!session) {
    redirect("/login");
  }
  const { user } = session;

  return (
    <div className="flex min-h-svh flex-col">
      {/* 스킵 링크(WCAG 2.4.1 Bypass Blocks) — 헤더 로고·로그아웃·사이트 Select·
          카테고리 3링크로 매 페이지 앞에 고정 탭 스톱 6개가 놓인다. 편집자 동선이
          "목록→상세→저장→목록"으로 라우트를 계속 오가는 구조라 이 6탭을 반복
          통과하게 된다.
          시각 스타일을 전부 focus: 아래 두는 이유 — sr-only는 padding·border를 0으로
          되돌리므로 접두사 없이 주면 숨은 상태에서도 박스가 24px 넓어진다.
          한계: 사이드바는 [site]/layout.tsx가 <main> 안에서 렌더하므로 #main으로
          뛰어도 사이드바 링크까지 건너뛰지는 못한다. 사이드바를 <main> 밖으로 빼는
          구조 변경은 이번 범위가 아니다(별도 티어). */}
      <a
        href="#main"
        className="focus:bg-background focus-visible:ring-ring/50 sr-only outline-none focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:border focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:shadow-md focus-visible:ring-[3px]"
      >
        본문으로 건너뛰기
      </a>
      <header className="flex shrink-0 items-center justify-between border-b px-6 py-3">
        <GuardedLink
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight whitespace-nowrap"
        >
          <Image
            src={adminLogo}
            alt=""
            aria-hidden
            width={20}
            height={20}
            className="ring-border size-5 shrink-0 rounded-[4px] ring-1"
          />
          ye0m2 admin
        </GuardedLink>
        <div className="flex items-center gap-3">
          {user.email ? (
            <span className="text-muted-foreground text-sm">{user.email}</span>
          ) : null}
          <SignOutButton action={signOut} />
        </div>
      </header>
      {/* 사이트 사이드바(§8)는 [site]/layout.tsx가 스스로 폭·패딩을 갖는다 —
          여기서 p-6을 주면 사이드바가 topbar·좌측 끝에서 24px 띄워진다.
          대신 사이드바 없는 페이지(대시보드 홈·로딩·404·에러)가 각자 패딩을 진다. */}
      {/* tabIndex={-1} — 해시 이동만으로는 브라우저별로 포커스가 따라오지 않아
          다음 Tab이 다시 헤더로 돌아가는 일이 생긴다. 프로그램적 포커스만 받고
          탭 순서에는 끼지 않도록 -1을 준다. */}
      {/* flex flex-col — [site]/layout.tsx의 사이드바 컬럼이 flex-1로 남은 높이를
          다 받게 한다. 이전의 min-h-full(%)은 flex-1 아이템의 불확정 높이에서 해석되지
          않아 짧은 페이지(사이트 홈·빈 목록)에서 사이드바 배경이 콘텐츠 높이에 끊겼다. */}
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col">
        {children}
      </main>
    </div>
  );
}
