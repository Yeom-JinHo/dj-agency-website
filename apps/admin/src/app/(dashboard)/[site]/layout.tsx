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
 *
 * 높이는 여기서 정하지 않는다. 예전의 min-h-full은 no-op이었다 — 부모인
 * (dashboard)/layout.tsx의 `<main className="flex-1">`이 height auto라 자식의
 * min-height:100%가 0으로 해소됐다. 지금은 사이드바가 스스로 뷰포트 높이
 * (100svh - --header-h)를 갖고, 그 값이 곧 이 그리드 행의 최소 높이가 된다.
 */
export default async function SiteLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ site: string }> }>) {
  const { site } = await params;
  if (!isSiteSlug(site)) notFound();

  return (
    <div className="grid grid-cols-[16rem_1fr]">
      <SiteSidebar site={site} />
      <div className="min-w-0 p-6">{children}</div>
    </div>
  );
}
