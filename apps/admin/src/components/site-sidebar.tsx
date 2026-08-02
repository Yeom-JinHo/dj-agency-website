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
 * 헤드에 사이트 스위처, 아래 카테고리 3종(아티스트·릴리즈·투어)을 세로로 나열한다.
 * active 판정은 카테고리 nav와 동형(현재 경로가 href와 같거나 그 하위). 데스크톱
 * 전용(모바일 스코프 종결) — 반응형 대응 없음, 고정 폭은 부모([site]/layout.tsx)의
 * grid 컬럼이 지정한다.
 *
 * 브랜드 액센트(인디고)를 primary/ring 밖으로 처음 확장한 지점이다. globals.css는
 * "primary/ring만 유채색"을 원칙으로 두지만, active 표시를 --sidebar-accent(0.97 무채색)
 * 배경에 맡기면 hover(50% 농도)와의 명도차가 육안으로 잡히지 않아 "지금 어느
 * 카테고리인지"가 읽히지 않았다. 좌측 인디고 바 + 옅은 인디고 틴트로 승격한다.
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
                // 포커스 링은 앱 공통 어휘(button·input·data-table과 동일).
                "focus-visible:ring-ring/50 flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors outline-none focus-visible:ring-[3px]",
                active
                  ? // 좌측 바는 before로 낸다 — 실제 요소를 하나 더 두면 gap-2 정렬에
                    // 끼어들어 아이콘·라벨이 밀린다. inset-y-1로 위아래 4px을 덜어
                    // 링크 높이보다 짧게 두고, 아이콘은 currentColor라 텍스트와 함께 물든다.
                    "bg-primary/8 text-primary relative font-medium before:absolute before:inset-y-1 before:left-0 before:w-0.5 before:rounded-full before:bg-primary"
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
