"use client";

import { usePathname } from "next/navigation";

import { CATEGORIES, isSiteSlug } from "@/lib/sites";
import { cn } from "@/lib/utils";
import { GuardedLink } from "@/components/guarded-link";

/**
 * 카테고리 내비(§8). 현재 site 컨텍스트를 라우트 첫 세그먼트에서 읽어 유지하고,
 * `/[site]/artists · /[site]/releases · /[site]/tours`로 링크한다. 사이트 컨텍스트
 * 밖(대시보드)에선 렌더하지 않는다(스위처만 표시). 미저장 변경 가드는 GuardedLink에
 * 위임한다(로고와 로직 공유).
 */
export function NavLinks() {
  const pathname = usePathname();
  const site = pathname.split("/")[1] ?? "";
  if (!isSiteSlug(site)) return null;

  return (
    <nav className="flex items-center gap-1">
      {CATEGORIES.map((item) => {
        const href = `/${site}/${item.segment}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <GuardedLink
            key={item.segment}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm transition-colors",
              active
                ? "bg-muted text-foreground font-medium"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            {item.label}
          </GuardedLink>
        );
      })}
    </nav>
  );
}
