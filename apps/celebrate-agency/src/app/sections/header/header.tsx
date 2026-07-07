import Image from "next/image";
import Link from "next/link";
import { IconArrowUpRight } from "@tabler/icons-react";

import icon from "@/app/icon.png";
import { BOOKING_MAILTO } from "@/consts/brand";

const NAV_LINKS = [
  { href: "#roster", label: "Roster" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 animate-hero-fade-in border-b border-ca-line bg-ca-bg/70 backdrop-blur-lg [animation-delay:840ms]">
      <div className="flex h-16 items-center justify-between px-6 lg:px-10">
        <Link href="#top" className="flex items-center gap-3">
          <Image
            src={icon}
            alt="Celebrate Agency"
            width={28}
            height={28}
            className="h-7 w-7 rounded-sm"
            priority
          />
          <span className="font-display text-lg tracking-[0.06em]">
            CELEBRATE<span className="hidden sm:inline"> AGENCY</span>
          </span>
        </Link>

        <div className="hidden gap-9 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs uppercase tracking-[0.14em] text-ca-fg/80 transition-opacity hover:opacity-100 active:opacity-100 lg:text-[13px]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3.5">
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.08em] text-ca-muted sm:inline-flex sm:items-center sm:gap-2 lg:text-[13px]">
            <span className="text-ca-red">●</span>
            Booking 2026
          </span>
          {/* 11px 라벨이라 WCAG AA(4.5:1) 적용 대상: 텍스트용 CTA 레드 토큰
              (ca-red-cta = #d62a20) + 순백 라벨로 ≈5:1 확보. ca-red는 전역
              액센트용으로 유지. BookingFiller 타일과 같은 토큰을 공유한다. */}
          {/* 형태: 전역 각진 시스템에 맞춘 사각 + 우상단 45° 사선 컷 — 히어로
              스티치·푸터 red chip의 사선 언어를 CTA에 상속. 컷 방향은 ↗ 화살표와 일치.
              clip-path는 outline까지 잘라내므로 시각 레이어(span)에만 적용하고
              포커스 링은 앵커가 담당한다(빨간 배경이라 ca-fg로 반전). */}
          <a
            href={BOOKING_MAILTO}
            className="group inline-flex focus-visible:outline-ca-fg"
          >
            <span className="inline-flex items-center gap-1.5 bg-ca-red-cta px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,0_100%)] group-hover:bg-ca-red-dim group-active:bg-ca-red-dim">
              Book a Set
              <IconArrowUpRight
                aria-hidden="true"
                className="size-[15px]"
                stroke={2.25}
              />
            </span>
          </a>
        </div>
      </div>
    </nav>
  );
}
