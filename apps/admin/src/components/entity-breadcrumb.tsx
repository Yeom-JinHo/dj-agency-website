"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
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
import { withSearch } from "@/lib/list-search";
import {
  CATEGORIES,
  SITE_ICONS,
  SITE_LABELS,
  type CategorySegment,
} from "@/lib/sites";

/**
 * 목록·상세([id])·새로 만들기(new) 공용 브레드크럼 — `사이트 > 카테고리 > 엔티티`.
 * 사이드바가 사이트를 Select로만 보여주는데 Select는 "입력 컨트롤"로 읽히지
 * "현재 위치"로 읽히지 않아, 사이트 4곳이 같은 카테고리·닮은 엔티티를 갖는 이 화면에서
 * 엉뚱한 사이트를 편집할 위험이 남았다. 현재 위치 표시는 시선이 머무는 콘텐츠 컬럼의
 * 이 브레드크럼이 맡고, 사이드바 Select는 전환 수단으로만 둔다 — 사이트명을 사이드바에
 * 한 번 더 크게 박아 두 곳에서 같은 말을 반복하지 않기 위해서다.
 *
 * `current`가 없으면 카테고리가 곧 현재 위치(목록 페이지)다. 9곳
 * (artists·releases·tours × 목록/[id]/new)이 이 한 컴포넌트를 공유해 중복 배선을 없앤다.
 * 링크는 GuardedLink로 미저장 가드를 건다(사이드바·헤더 로고와 동일한 어휘).
 */
export function EntityBreadcrumb({
  site,
  category,
  current,
}: {
  site: SiteSlug;
  category: CategorySegment;
  /** 상세·새로 만들기에서만 준다. 없으면 카테고리가 마지막 단(목록). */
  current?: string;
}) {
  const label =
    CATEGORIES.find((c) => c.segment === category)?.label ?? category;
  // 목록의 검색·정렬 쿼리를 카테고리 링크에도 실어준다 — 저장·취소 복귀와 같은 규약이라
  // 브레드크럼으로 되돌아갈 때만 검색어가 날아가는 일이 없다. 사이트 링크는 카테고리를
  // 벗어나므로 쿼리를 버린다.
  const searchParams = useSearchParams();

  return (
    <Breadcrumb aria-label="현재 위치">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <GuardedLink
              href={`/${site}`}
              className="inline-flex items-center gap-1.5"
            >
              <Image
                src={SITE_ICONS[site]}
                alt=""
                aria-hidden
                width={16}
                height={16}
                className="ring-border size-4 shrink-0 rounded-[4px] ring-1"
              />
              {SITE_LABELS[site]}
            </GuardedLink>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {current === undefined ? (
            <BreadcrumbPage>{label}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink asChild>
              <GuardedLink
                href={withSearch(`/${site}/${category}`, searchParams)}
              >
                {label}
              </GuardedLink>
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
        {current === undefined ? null : (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{current}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
