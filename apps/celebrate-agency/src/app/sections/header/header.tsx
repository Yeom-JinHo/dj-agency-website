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
          {/* 형태: 전역 각진 시스템에서 유일한 곡선 — 형태 대비로 최상위 CTA를
              강조하는 의도적 예외(사선 컷 시안 검토 후 pill 유지 결정).
              포커스 링은 빨간 배경이라 ca-fg로 반전, radius를 따라 그려진다. */}
          {/* 프레스: 스티치가 "콱 박히듯" 눌렸다 복귀 — 하우스 문법상 큰 변위는
              CTA에만 허용되므로 0.97로 절제. */}
          <a
            href={BOOKING_MAILTO}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-ca-red-cta px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-[background-color,transform] duration-200 hover:bg-ca-red-dim active:scale-[0.97] active:bg-ca-red-dim focus-visible:outline-ca-fg"
          >
            Book a Set
            <IconArrowUpRight
              aria-hidden="true"
              className="size-[15px]"
              stroke={2.25}
            />
          </a>
        </div>
      </div>
    </nav>
  );
}
