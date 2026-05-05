"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { linkLimit, links } from "./config";
import Link from "next/link";

import { Icon } from "@repo/ui/common/Icon";
import { motion } from "motion/react";

type UnderlineRect = { left: number; width: number };

export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [underline, setUnderline] = useState<UnderlineRect | null>(null);

  const navRef = useRef<HTMLDivElement | null>(null);
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const activeHref =
    hoveredLink ??
    (links.some((link) => link.href === pathname) ? pathname : null);

  const measureUnderline = useCallback(() => {
    if (!activeHref || !navRef.current) {
      setUnderline(null);
      return;
    }
    const linkEl = linkRefs.current[activeHref];
    if (!linkEl) {
      setUnderline(null);
      return;
    }
    const navRect = navRef.current.getBoundingClientRect();
    const linkRect = linkEl.getBoundingClientRect();
    setUnderline({
      left: linkRect.left - navRect.left,
      width: linkRect.width,
    });
  }, [activeHref]);

  useLayoutEffect(() => {
    measureUnderline();
  }, [measureUnderline]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
      measureUnderline();
    };

    window.addEventListener("resize", handleResize);

    let cancelled = false;
    if (typeof document !== "undefined" && "fonts" in document) {
      document.fonts.ready.then(() => {
        if (!cancelled) measureUnderline();
      });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("resize", handleResize);
    };
  }, [measureUnderline]);

  return (
    <header
      className={[
        "bg-background/80 fixed z-[900] w-full backdrop-blur-sm",
        "transform transition-opacity transition-transform duration-[800ms] ease-out will-change-transform",
        mounted ? "translate-y-0 opacity-100" : "-translate-y-20 opacity-0",
        "motion-reduce:transform-none motion-reduce:opacity-100 motion-reduce:transition-none",
      ].join(" ")}
      onMouseLeave={() => setHoveredLink(null)}
    >
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex w-full justify-between">
          <Link
            href="/"
            className="inline-flex items-center justify-center text-2xl font-semibold"
          >
            v.f.labs
          </Link>

          <button className="md:hidden" onClick={toggleMenu}>
            <span className="sr-only">{isOpen ? "Close" : "Menu"}</span>
            {isOpen ? (
              <Icon name="LuClose" className="h-6 w-6" />
            ) : (
              <Icon name="LuMenu" className="h-6 w-6" />
            )}
          </button>
          <div className="hidden md:flex md:w-auto md:items-center">
            <nav className="flex items-center gap-4">
              <div
                ref={navRef}
                className="relative flex items-center gap-4 lg:gap-6"
              >
                {links.slice(0, linkLimit).map(({ title, href }, index) => (
                  <Link
                    className="flex items-center text-xl font-medium underline-offset-4 transition-colors"
                    href={href}
                    key={`header-desktop-link_${index}`}
                    ref={(el) => {
                      linkRefs.current[href] = el;
                    }}
                    onMouseEnter={() => setHoveredLink(href)}
                  >
                    {title}
                  </Link>
                ))}
                {underline ? (
                  <motion.div
                    aria-hidden
                    className="bg-primary pointer-events-none absolute bottom-0 h-0.5"
                    initial={false}
                    animate={{ left: underline.left, width: underline.width }}
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                ) : null}
              </div>
              {/* <div className="flex items-center gap-2">
                <ThemeToggle />
              </div> */}
            </nav>
          </div>
        </div>
      </div>
      <div
        className="overflow-hidden bg-transparent md:hidden"
        style={{
          maxHeight: isOpen ? "60vh" : 0,
          transition: "max-height 300ms ease-in-out",
          pointerEvents: isOpen ? "auto" : "none",
          visibility: isOpen ? "visible" : "hidden",
        }}
      >
        <div className="flex flex-col gap-4 p-4">
          {links.map(({ title, href }, index) => (
            <Link
              className="flex items-center text-xl font-medium underline-offset-4 hover:underline"
              href={href}
              onClick={toggleMenu}
              key={`header-mobile-link_${index}`}
            >
              {title}
            </Link>
          ))}
          {/* <div className="flex w-full items-center justify-end">
            <ThemeToggle />
          </div> */}
        </div>
      </div>
    </header>
  );
}
