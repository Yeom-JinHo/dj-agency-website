"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { linkLimit, links } from "./config";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock scroll + Esc-to-close while the mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const navLinks = links.slice(0, linkLimit);

  return (
    <>
      <header
        className={[
          "fixed top-0 z-[900] w-full transition-all duration-500 ease-out will-change-transform",
          // Transparent over the hero, frosted + divider once scrolled.
          scrolled
            ? "bg-background/80 border-b border-white/10 backdrop-blur-md"
            : "border-b border-transparent bg-transparent backdrop-blur-0",
          // Entrance animation.
          mounted ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0",
          "motion-reduce:transform-none motion-reduce:opacity-100",
        ].join(" ")}
      >
        <div
          className={[
            "flex items-center justify-between px-4 transition-all duration-500 ease-out md:px-6",
            scrolled ? "h-14" : "h-20 md:h-24",
          ].join(" ")}
        >
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className={[
              "font-display inline-flex items-center leading-none tracking-[0.04em] whitespace-nowrap uppercase transition-all duration-500 ease-out",
              scrolled ? "text-xl md:text-2xl" : "text-2xl md:text-4xl",
            ].join(" ")}
          >
            Payday Records
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex md:items-center">
            <div className="flex -translate-y-[2px] items-center gap-4 lg:gap-6">
              {navLinks.map(({ title, href }, index) => (
                <Link
                  className="flex items-center text-sm font-semibold tracking-[0.12em] uppercase underline-offset-4 transition-opacity hover:underline"
                  href={href}
                  key={`header-desktop-link_${index}`}
                >
                  {title}
                </Link>
              ))}
            </div>
          </nav>

          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-white/85 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none md:hidden"
          >
            {menuOpen ? (
              <IconX className="h-6 w-6" stroke={2} />
            ) : (
              <IconMenu2 className="h-6 w-6" stroke={2} />
            )}
          </button>
        </div>
      </header>

      {/* Mobile full-screen menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        className={[
          "fixed inset-0 z-[1000] flex flex-col bg-background/95 backdrop-blur-xl md:hidden",
          "transition-opacity duration-300 ease-out motion-reduce:transition-none",
          menuOpen ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <div className="flex h-20 items-center justify-between px-4">
          <span className="font-display text-2xl tracking-[0.04em] uppercase">
            Payday Records
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="-mr-2 inline-flex h-11 w-11 items-center justify-center text-white/85 transition-colors hover:text-white focus-visible:text-white focus-visible:outline-none"
          >
            <IconX className="h-6 w-6" stroke={2} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col justify-center px-4 pb-24">
          {navLinks.map(({ title, href }, index) => (
            <Link
              key={`header-mobile-link_${index}`}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{ transitionDelay: menuOpen ? `${index * 60 + 80}ms` : "0ms" }}
              className={[
                "font-display py-4 text-5xl leading-none tracking-[0.02em] text-white/90 uppercase",
                "transition-all duration-500 ease-out hover:text-white focus-visible:text-white focus-visible:outline-none",
                "motion-reduce:transition-none",
                menuOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              ].join(" ")}
            >
              {title}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
