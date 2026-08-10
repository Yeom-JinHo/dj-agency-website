import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { SiteSidebar } from "@/components/site-sidebar";
import { getAdminSession } from "@/lib/auth";
import { isSiteSlug } from "@/lib/sites";

/**
 * 사이트 세그먼트 가드 + 사이드바 레이아웃. 유효하지 않은 site 파라미터는
 * notFound() — 하위 카테고리 라우트(artists·releases·tours)가 모두 이 가드와
 * 사이드바를 공유한다. 데스크톱 전용(모바일 스코프 종결) — 사이드바는 고정 폭,
 * 콘텐츠 컬럼은 min-w-0로 오버플로만 방지한다(반응형 대응 없음). 패딩은
 * (dashboard)/layout.tsx가 아니라 콘텐츠 컬럼이 직접 갖는다 — 그래야 사이드바가
 * topbar 바로 아래·좌측 끝에 여백 없이 붙는다.
 *
 * 인가 가드도 여기 하나로 모인다: 부여되지 않은 사이트는 하위 라우트를 렌더하기
 * 전에 끊는다. 이 레이아웃을 거치지 않고 도달할 수 있는 [site] 하위 화면은 없다.
 */
export default async function SiteLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ site: string }> }>) {
  const { site } = await params;
  if (!isSiteSlug(site)) notFound();

  // 미부여 사이트는 403이 아니라 404로 덮는다 — "권한이 없다"는 응답은 그 사이트가
  // 존재한다는 사실을 확인해준다. 어차피 편집자가 스스로 열 수 있는 문이 아니다.
  const allowedSites = (await getAdminSession())?.allowedSites ?? [];
  if (!allowedSites.includes(site)) notFound();

  // flex-1 — 부모 main(flex flex-col)의 남은 높이를 그대로 받아 사이드바 배경이
  // 짧은 페이지에서도 뷰포트 바닥까지 이어진다(min-h-full은 %라 해석되지 않았다).
  return (
    <div className="grid flex-1 grid-cols-[16rem_1fr]">
      <SiteSidebar site={site} sites={allowedSites} />
      <div className="min-w-0 p-6">{children}</div>
    </div>
  );
}
