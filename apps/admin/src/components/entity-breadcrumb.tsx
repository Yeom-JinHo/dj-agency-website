import type { SiteSlug } from "@repo/content/schema";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { GuardedLink } from "@/components/guarded-link";
import { CATEGORIES, type CategorySegment } from "@/lib/sites";

/**
 * 상세([id])·새로 만들기(new) 페이지 전용 브레드크럼. 사이드바가 사이트·카테고리
 * 컨텍스트를 상시 표시하므로 목록 페이지에는 넣지 않는다(과잉 방지) — 6곳
 * (artists·releases·tours × [id]/new)이 이 한 컴포넌트를 공유해 중복 배선을 없앤다.
 * 카테고리 링크는 GuardedLink로 미저장 가드를 건다(사이드바·헤더 로고와 동일한 어휘).
 */
export function EntityBreadcrumb({
  site,
  category,
  current,
}: {
  site: SiteSlug;
  category: CategorySegment;
  current: string;
}) {
  const label =
    CATEGORIES.find((c) => c.segment === category)?.label ?? category;

  return (
    <Breadcrumb aria-label="현재 위치">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <GuardedLink href={`/${site}/${category}`}>{label}</GuardedLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{current}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
