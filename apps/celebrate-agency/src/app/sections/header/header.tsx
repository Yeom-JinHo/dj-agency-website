import Image from "next/image";
import Link from "next/link";

import icon from "@/app/icon.png";

const NAV_LINKS = [
  { href: "#roster", label: "Roster" },
  { href: "#services", label: "Services" },
  { href: "#work", label: "Work" },
  { href: "#about", label: "About" },
  { href: "#contact", label: "Contact" },
];

export default function Header() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-ca-line bg-ca-bg/70 backdrop-blur-lg">
      <div className="flex h-16 items-center justify-between px-8">
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
            CELEBRATE / AGENCY
          </span>
        </Link>

        <div className="hidden gap-9 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs uppercase tracking-[0.14em] text-ca-fg/80 transition-opacity hover:opacity-100"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3.5">
          <span className="hidden font-mono text-[11px] uppercase tracking-[0.08em] text-ca-muted sm:inline-flex sm:items-center sm:gap-2">
            <span className="text-ca-red">●</span>
            Booking 2026
          </span>
          <Link
            href="#contact"
            className="rounded-full border border-ca-fg px-4 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors hover:bg-ca-fg hover:text-ca-bg"
          >
            Start a project
          </Link>
        </div>
      </div>
    </nav>
  );
}
