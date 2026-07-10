"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@repo/ui";

const NAV_LINKS = [
  { label: "music", href: "/music" },
  { label: "tour", href: "/tour" },
] as const;

export function Header() {
  const pathname = usePathname();

  return (
    <header className="fixed top-0 right-0 z-20 flex gap-8 px-6 pt-6 md:gap-10 md:px-10 md:pt-8">
      {NAV_LINKS.map(({ label, href }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "font-mono text-[11px] tracking-[0.3em] text-[#111111] uppercase",
              "pb-px bg-[image:linear-gradient(currentColor,currentColor)] bg-[position:0_100%] bg-no-repeat",
              "transition-[background-size] duration-200 ease-out motion-reduce:transition-none",
              // tracking-[0.3em]이 마지막 글자 뒤에도 자간을 남기므로 밑줄에서 그만큼 덜어낸다.
              "hover:bg-[length:calc(100%-0.3em)_1px] focus-visible:bg-[length:calc(100%-0.3em)_1px]",
              isActive ? "bg-[length:calc(100%-0.3em)_1px]" : "bg-[length:0%_1px]",
            )}
          >
            {label}
          </Link>
        );
      })}
    </header>
  );
}
