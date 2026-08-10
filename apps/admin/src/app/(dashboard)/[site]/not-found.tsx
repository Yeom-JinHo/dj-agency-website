"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  CATEGORIES,
  hasSiteCategory,
  isSiteSlug,
  SITE_LABELS,
} from "@/lib/sites";

/**
 * [site] 그룹 404 — 사이드바([site]/layout.tsx)를 유지한 채 콘텐츠 컬럼만 이
 * 안내로 교체한다((dashboard)/not-found.tsx는 site 파라미터 자체가 무효라
 * 사이드바를 그릴 근거가 없을 때만 쓰인다). 콘텐츠 컬럼은 grid stretch로 이미
 * 전체 높이를 확보하므로 min-h-[60vh] 대신 min-h-full로 그 안에서 중앙 정렬한다.
 *
 * 이 경계에는 원인이 다른 두 404가 함께 도착한다 — 노출 범위 밖 카테고리
 * (lib/category-layout.ts의 가드)와 없는 항목(상세 페이지의 notFound()).
 * 카테고리 폴더에 not-found를 둬서 가를 수는 없다: not-found는 같은 세그먼트
 * layout의 *안쪽*에 렌더되므로(Next 계층상 layout > … > not-found > page) 그 layout이
 * 던진 404는 자기 폴더의 not-found를 건너뛰고 여기까지 올라온다. 그래서 판정을 여기서
 * 한다 — 한 문구로 뭉뚱그리면 한쪽은 반드시 틀린 안내가 된다.
 * `/payday-records/artists`는 주소가 잘못된 것도, 삭제된 항목도 아니다.
 *
 * 클라이언트 컴포넌트인 이유: not-found.tsx는 params를 받지 못해(Next 제약)
 * 어느 사이트·카테고리인지 알 수단이 pathname뿐이다.
 */
export default function SiteNotFound() {
  const pathname = usePathname();
  const [, first = "", second = ""] = pathname.split("/");
  const site = isSiteSlug(first) ? first : undefined;
  // 세그먼트 리터럴을 CATEGORIES에서 되찾아 hasSiteCategory에 넘긴다(string 좁힘) —
  // site-switcher와 같은 패턴.
  const category = CATEGORIES.find((c) => c.segment === second);
  const outOfScope =
    site !== undefined &&
    category !== undefined &&
    !hasSiteCategory(site, category.segment);

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 text-center">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">
          {outOfScope
            ? "이 사이트에서 다루지 않는 항목입니다"
            : "페이지를 찾을 수 없습니다"}
        </h1>
        <p className="text-muted-foreground text-sm">
          {outOfScope && site && category
            ? `${SITE_LABELS[site]}에서는 ${category.label}를 관리하지 않습니다.`
            : "주소가 잘못됐거나 이미 삭제된 항목일 수 있습니다."}
        </p>
      </div>
      {/* 범위 밖이면 그 카테고리 목록이 애초에 없으므로 사이트 홈으로 보낸다.
          나머지 404는 종전대로 대시보드로 — 어디서 왔는지 모르는 상태의 기본값이다. */}
      <Button asChild variant="outline">
        {outOfScope && site ? (
          <Link href={`/${site}`}>사이트 홈으로</Link>
        ) : (
          <Link href="/">대시보드로 돌아가기</Link>
        )}
      </Button>
    </div>
  );
}
