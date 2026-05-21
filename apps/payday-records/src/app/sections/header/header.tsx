"use client";

import { useEffect, useState } from "react";
import { linkLimit, links } from "./config";
import Link from "next/link";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);

    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
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
        <div className="flex w-full items-center justify-between">
          <Link
            href="/"
            className={[
              "font-display inline-flex w-full items-center justify-center leading-none tracking-[0.04em] whitespace-nowrap uppercase transition-all duration-500 ease-out md:w-auto md:justify-start",
              scrolled ? "text-xl md:text-2xl" : "text-3xl md:text-4xl",
            ].join(" ")}
          >
            Payday Records
          </Link>

          <div className="hidden md:flex md:w-auto md:items-center">
            <nav className="flex items-center gap-4">
              <div className="flex items-center gap-4 lg:gap-6">
                {links.slice(0, linkLimit).map(({ title, href }, index) => (
                  <Link
                    className="flex items-center text-sm font-medium tracking-[0.12em] uppercase underline-offset-4 transition-opacity hover:underline"
                    href={href}
                    key={`header-desktop-link_${index}`}
                  >
                    {title}
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
