"use client";

import Image from "next/image";
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
    <header className="fixed inset-x-0 top-0 z-20 flex items-center px-6 pt-6 md:px-10 md:pt-8">
      {/* 전 라우트(홈 포함) 공통으로 노출하는 좌상단 홈 복귀 앵커. 우측 nav와 같은 top 기준선. */}
      <Link
        href="/"
        aria-label="Juntaro — home"
        className="-m-1 p-1 opacity-70 transition-opacity duration-200 ease-out hover:opacity-100 focus-visible:opacity-100 motion-reduce:transition-none"
      >
        <Image
          src="/images/logo.webp"
          alt="Juntaro"
          width={400}
          height={300}
          className="h-10 w-auto invert md:h-11"
        />
      </Link>

      <nav className="ml-auto flex gap-8 md:gap-10">
        {NAV_LINKS.map(({ label, href }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                // 네비는 기능 요소라 캡션·서명(11px)보다 한 급 키운다. 커진 만큼 자간은
                // 조여(0.3→0.25em) 낱자가 흩어지지 않게 한다.
                "font-mono text-[13px] tracking-[0.25em] text-[#111111] uppercase",
                "pb-px bg-[image:linear-gradient(currentColor,currentColor)] bg-[position:0_100%] bg-no-repeat",
                "transition-[background-size] duration-200 ease-out motion-reduce:transition-none",
                // tracking이 마지막 글자 뒤에도 자간을 남기므로 밑줄에서 그만큼 덜어낸다.
                "hover:bg-[length:calc(100%-0.25em)_1px] focus-visible:bg-[length:calc(100%-0.25em)_1px]",
                isActive
                  ? "bg-[length:calc(100%-0.25em)_1px]"
                  : "bg-[length:0%_1px]"
              )}
            >
              {label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
