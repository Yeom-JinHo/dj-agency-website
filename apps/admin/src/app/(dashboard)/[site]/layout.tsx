import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { SiteSidebar } from "@/components/site-sidebar";
import { isSiteSlug } from "@/lib/sites";

/**
 * 사이트 세그먼트 가드 + 사이드바 레이아웃. 유효하지 않은 site 파라미터는
 * notFound() — 하위 카테고리 라우트(artists·releases·tours)가 모두 이 가드와
 * 사이드바를 공유한다. 데스크톱 전용(모바일 스코프 종결) — 사이드바는 고정 폭,
 * 콘텐츠 컬럼은 min-w-0로 오버플로만 방지한다(반응형 대응 없음). 패딩은
 * (dashboard)/layout.tsx가 아니라 콘텐츠 컬럼이 직접 갖는다 — 그래야 사이드바가
 * topbar 바로 아래·좌측 끝에 여백 없이 붙는다.
 */
export default async function SiteLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ site: string }> }>) {
  const { site } = await params;
  if (!isSiteSlug(site)) notFound();

  return (
    <div className="grid min-h-full grid-cols-[16rem_1fr]">
      <SiteSidebar site={site} />
      <div className="min-w-0 p-6">{children}</div>
    </div>
  );
}
