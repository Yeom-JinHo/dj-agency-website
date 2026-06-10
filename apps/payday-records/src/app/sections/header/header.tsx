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

  // Lock background scroll while the mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const navLinks = links.slice(0, linkLimit);
  const half = Math.ceil(navLinks.length / 2);
  const leftLinks = navLinks.slice(0, half);
  const rightLinks = navLinks.slice(half);

  const navLinkClass =
    "flex items-center text-[15px] font-semibold tracking-[0.18em] uppercase underline-offset-4 transition-opacity hover:underline";

  return (
    <>
      <header
        className={[
          "fixed top-0 z-[900] w-full transition-all duration-500 ease-out will-change-transform",
          // Transparent over the hero, frosted + divider once scrolled.
          // Scrolled: frosted bar. On desktop the frost moves to the inner
          // pill, so the header itself goes transparent and gains a top gap.
          scrolled
            ? "bg-background/80 border-b border-white/10 backdrop-blur-md md:border-b-transparent md:bg-transparent md:pt-3 md:backdrop-blur-none"
            : "border-b border-transparent bg-transparent backdrop-blur-0",
          // Entrance animation.
          mounted ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0",
          "motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none",
        ].join(" ")}
      >
        {/* Mobile: logo (left) + toggle (right). Desktop: split nav around a
            centered wordmark via a 3-column grid (1fr · auto · 1fr). */}
        <div
          className={[
            "mx-auto grid w-full max-w-[1280px] grid-cols-[auto_1fr_auto] items-center px-6 transition-all duration-500 ease-out motion-reduce:transition-none md:grid-cols-[1fr_auto_1fr] md:px-10",
            // Desktop scrolled → centered floating pill (shrink toward content,
            // rounded, hairline border, subtle shadow). Mobile keeps the bar.
            scrolled
              ? "h-14 md:max-w-[780px] md:rounded-2xl md:border md:border-white/10 md:bg-background/80 md:shadow-[0_14px_44px_-16px_rgba(0,0,0,0.6)] md:backdrop-blur-md"
              : "h-20",
          ].join(" ")}
        >
          {/* Left nav (desktop only) — clustered toward the centered logo. */}
          <nav className="hidden md:flex md:items-center md:justify-self-end">
            <div className="flex items-center gap-7 lg:gap-8">
              {leftLinks.map(({ title, href }, index) => (
                <Link className={navLinkClass} href={href} key={`hl_${index}`}>
                  {title}
                </Link>
              ))}
            </div>
          </nav>

          {/* Wordmark — left on mobile, centered on desktop. */}
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className={[
              "font-display inline-flex items-center justify-self-start leading-none tracking-[0.04em] whitespace-nowrap uppercase transition-all duration-500 ease-out md:justify-self-center md:px-10",
              scrolled ? "text-xl md:text-2xl" : "text-2xl md:text-4xl",
            ].join(" ")}
          >
            Payday Records
          </Link>

          {/* Right cell: nav (desktop, clustered toward logo) + mobile toggle. */}
          <div className="flex items-center justify-self-end md:justify-self-start">
            <nav className="hidden md:flex md:items-center">
              <div className="flex items-center gap-7 lg:gap-8">
                {rightLinks.map(({ title, href }, index) => (
                  <Link className={navLinkClass} href={href} key={`hr_${index}`}>
                    {title}
                  </Link>
                ))}
              </div>
            </nav>

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
