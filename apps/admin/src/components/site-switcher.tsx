"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import type { SiteSlug } from "@repo/content/schema";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CATEGORIES, isSiteSlug, SITE_ICONS, SITE_LABELS } from "@/lib/sites";
import { confirmLeaveUnsaved } from "@/lib/unsaved-guard";

/**
 * 사이드바 헤드 사이트 스위처(§8). 현재 라우트 첫 세그먼트로 활성 사이트를 표시하고,
 * 선택 시 같은 카테고리 목록(`/[site]/[category]`) 또는 사이트 홈(`/[site]`)으로
 * 이동한다. 사이트 컨텍스트 밖(대시보드)에선 placeholder만 표시.
 *
 * 카테고리는 목록 레벨에서만 유지한다 — 교차 사이트 엔티티 id 오염은 상세
 * (`/[site]/releases/[id]`)에만 해당하는 위험이고, 목록에는 id가 없다. "payday 뮤직을
 * 보다 juntaro 뮤직을 본다"가 이 스위처의 주 용도인데 매번 사이트 홈으로 되돌리면
 * 카테고리를 다시 골라야 했다. 상세·새로 만들기(`new`)에서는 종전대로 사이트 홈으로
 * 보낸다.
 *
 * 목록은 SITE_SLUGS 전체가 아니라 서버가 내려준 권한 사이트(editor_sites)다 — 클라이언트
 * 컴포넌트라 스스로 조회할 수 없다. 권한 밖 사이트를 띄우면 골라도 [site] 레이아웃이
 * 404로 막아 "선택했는데 없는 페이지"가 된다.
 */
export function SiteSwitcher({ sites }: { sites: SiteSlug[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const [, first = "", category = "", detail] = pathname.split("/");
  const current = isSiteSlug(first) ? first : undefined;
  // 3번째 세그먼트가 있으면 상세(또는 new)라 카테고리를 버린다.
  const keptCategory =
    detail === undefined && CATEGORIES.some((c) => c.segment === category)
      ? category
      : undefined;

  return (
    <Select
      value={current}
      onValueChange={(site) => {
        if (!confirmLeaveUnsaved()) return;
        router.push(keptCategory ? `/${site}/${keptCategory}` : `/${site}`);
      }}
    >
      <SelectTrigger size="sm" className="w-full" aria-label="사이트 선택">
        <SelectValue placeholder="사이트 선택" />
      </SelectTrigger>
      <SelectContent>
        {sites.map((site) => (
          <SelectItem key={site} value={site}>
            <Image
              src={SITE_ICONS[site]}
              alt=""
              aria-hidden
              width={16}
              height={16}
              className="ring-border size-4 shrink-0 rounded-[4px] ring-1"
            />
            {SITE_LABELS[site]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
