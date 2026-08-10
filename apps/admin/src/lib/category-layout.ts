import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { hasSiteCategory, isSiteSlug, type CategorySegment } from "@/lib/sites";

/**
 * 카테고리 라우트 가드. nav에서 감추는 것만으로는 `/payday-records/artists`를 직접
 * 치거나 북마크로 들어오는 경로가 그대로 열린다 — 노출 범위(SITE_CATEGORY_SEGMENTS)
 * 밖이면 notFound()로 막는다.
 *
 * 카테고리 폴더의 layout에 두는 이유: `[site]/layout.tsx`는 카테고리 세그먼트를 읽지
 * 못하고(자기 아래 세그먼트를 모른다), 페이지마다 가드를 복붙하면 목록·new·상세 3곳이
 * 따로 논다. 폴더당 layout 하나가 그 3곳을 한 번에 덮는다. DB를 건드리지 않으므로
 * 조회는 늘지 않고, notFound()는 `[site]/not-found.tsx`가 받는다.
 *
 * site 자체의 유효성은 상위 `[site]/layout.tsx`도 검사하지만 여기서도 좁힌다 —
 * hasSiteCategory에 SiteSlug를 넘기기 위한 타입 좁힘이자 방어 심층화(페이지들의
 * siteSlugSchema 재검증과 같은 패턴).
 */
export function createCategoryLayout(segment: CategorySegment) {
  return async function CategoryLayout({
    children,
    params,
  }: Readonly<{ children: ReactNode; params: Promise<{ site: string }> }>) {
    const { site } = await params;
    if (!isSiteSlug(site) || !hasSiteCategory(site, segment)) notFound();
    return children;
  };
}
