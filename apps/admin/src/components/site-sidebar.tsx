"use client";

import { usePathname } from "next/navigation";
import type { SiteSlug } from "@repo/content/schema";

import { CATEGORY_ICONS } from "@/components/category-icons";
import { GuardedLink } from "@/components/guarded-link";
import { SiteSwitcher } from "@/components/site-switcher";
import { CATEGORIES } from "@/lib/sites";
import { cn } from "@/lib/utils";

/**
 * 사이트 사이드바(§8) — topbar 혼합형 내비(SiteSwitcher+NavLinks)를 대체한다.
 * 헤드에 사이트 스위처, 아래 카테고리 3종(아티스트·뮤직·투어)을 세로로 나열한다.
 * active 판정은 카테고리 nav와 동형(현재 경로가 href와 같거나 그 하위). 데스크톱
 * 전용(모바일 스코프 종결) — 반응형 대응 없음, 고정 폭은 부모([site]/layout.tsx)의
 * grid 컬럼이 지정한다.
 */
export function SiteSidebar({ site }: { site: SiteSlug }) {
  const pathname = usePathname();

  return (
    <div className="bg-sidebar text-sidebar-foreground border-sidebar-border flex flex-col border-r">
      <div className="border-sidebar-border border-b p-3">
        <SiteSwitcher />
      </div>
      {/* 헤드(p-3 12px + SiteSwitcher 트리거 자체 px-3 12px = 24px)와 좌측
          기준선을 맞추려 px-3(12px) + GuardedLink 자체 px-3(12px) = 24px로 통일. */}
      <nav aria-label="사이트 섹션" className="flex flex-col gap-0.5 px-3 py-2">
        {CATEGORIES.map((item) => {
          const href = `/${site}/${item.segment}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          const Icon = CATEGORY_ICONS[item.segment];
          return (
            <GuardedLink
              key={item.segment}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-sidebar-accent text-primary font-medium"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              {item.label}
            </GuardedLink>
          );
        })}
      </nav>
    </div>
  );
}
