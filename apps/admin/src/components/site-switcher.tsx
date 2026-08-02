"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { SITE_SLUGS } from "@repo/content/schema";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { isSiteSlug, SITE_ICONS, SITE_LABELS } from "@/lib/sites";
import { confirmLeaveUnsaved } from "@/lib/unsaved-guard";

/**
 * 사이드바 헤드 사이트 스위처(§8). 현재 라우트 첫 세그먼트로 활성 사이트를 표시하고,
 * 선택 시 해당 사이트 홈(`/[site]`)으로 이동한다. 사이트 컨텍스트 밖(대시보드)에선
 * placeholder만 표시. 교차 사이트 엔티티 id 오염을 피하려 카테고리는 유지하지 않고
 * 사이트 홈으로 보낸다.
 */
export function SiteSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const first = pathname.split("/")[1] ?? "";
  const current = isSiteSlug(first) ? first : undefined;

  return (
    <Select
      value={current}
      onValueChange={(site) => {
        if (!confirmLeaveUnsaved()) return;
        router.push(`/${site}`);
      }}
    >
      <SelectTrigger size="sm" className="w-full" aria-label="사이트 선택">
        <SelectValue placeholder="사이트 선택" />
      </SelectTrigger>
      <SelectContent>
        {SITE_SLUGS.map((site) => (
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
