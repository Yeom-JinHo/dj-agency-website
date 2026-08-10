import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldOff } from "lucide-react";
import { getEditorSites } from "@repo/content/editors";

import { EmptyState } from "@/components/empty-state";
import { SiteSidebar } from "@/components/site-sidebar";
import { Button } from "@/components/ui/button";
import { isSiteSlug, SITE_LABELS } from "@/lib/sites";

/**
 * 사이트 세그먼트 가드 + 사이드바 레이아웃. 유효하지 않은 site 파라미터는
 * notFound() — 하위 카테고리 라우트(artists·releases·tours)가 모두 이 가드와
 * 사이드바를 공유한다. 데스크톱 전용(모바일 스코프 종결) — 사이드바는 고정 폭,
 * 콘텐츠 컬럼은 min-w-0로 오버플로만 방지한다(반응형 대응 없음). 패딩은
 * (dashboard)/layout.tsx가 아니라 콘텐츠 컬럼이 직접 갖는다 — 그래야 사이드바가
 * topbar 바로 아래·좌측 끝에 여백 없이 붙는다.
 *
 * 인가 가드도 여기 하나로 모은다(editor_sites, 0002 마이그레이션). 하위 라우트가
 * 전부 이 레이아웃을 거치므로 목록·상세·new가 각자 검사할 필요가 없다. 다만
 * **서버 액션은 레이아웃을 거치지 않는다** — 액션 쪽 방어는 lib/site-access.ts가 맡고,
 * 최종 강제는 어느 쪽이든 쓰기 RLS다.
 */
export default async function SiteLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ site: string }> }>) {
  const { site } = await params;
  if (!isSiteSlug(site)) notFound();

  const sites = await getEditorSites();

  // 권한 없는 사이트는 404가 아니라 "권한 없음"으로 말한다. 은닉할 것이 없어서다 —
  // sites 테이블은 공개 읽기이고 4개 사이트 모두 공개된 브랜드다. 404로 감추면
  // 아무것도 지키지 못하면서, 권한이 회수된 편집자에게는 북마크가 "주소가 잘못됐거나
  // 삭제된 항목"으로 보여 원인을 짐작할 수 없게 만든다.
  // 사이드바는 그리지 않는다 — 사이트 스위처·카테고리 nav 전부가 이 사이트로 들어가는
  // 링크라, 막아 놓고 내비게이션만 띄우면 눌러도 같은 화면으로 되돌아온다.
  if (!sites.includes(site)) {
    return (
      <div className="p-6">
        <EmptyState
          icon={ShieldOff}
          title={`${SITE_LABELS[site]}에 접근할 수 없습니다`}
          description="이 사이트에 대한 권한이 없습니다. 필요하다면 운영자에게 요청해주세요."
          className="max-w-6xl"
          action={
            <Button asChild variant="outline">
              <Link href="/">대시보드로 돌아가기</Link>
            </Button>
          }
        />
      </div>
    );
  }

  // flex-1 — 부모 main(flex flex-col)의 남은 높이를 그대로 받아 사이드바 배경이
  // 짧은 페이지에서도 뷰포트 바닥까지 이어진다(min-h-full은 %라 해석되지 않았다).
  // sites를 사이드바로 내린다 — 스위처는 클라이언트 컴포넌트라 스스로 권한을 조회할 수
  // 없고, 여기서 이미 조회한 값을 재사용하면 왕복도 늘지 않는다.
  return (
    <div className="grid flex-1 grid-cols-[16rem_1fr]">
      <SiteSidebar site={site} sites={sites} />
      <div className="min-w-0 p-6">{children}</div>
    </div>
  );
}
