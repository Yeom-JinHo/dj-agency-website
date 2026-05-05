"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { linkLimit, links } from "./config";
import Link from "next/link";

import { Icon } from "@repo/ui/common/Icon";
import { motion } from "motion/react";
export default function Header() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  const activeHref =
    hoveredLink ?? (links.some((link) => link.href === pathname) ? pathname : null);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
              <div className="flex items-center gap-4 lg:gap-6">
                {links.slice(0, linkLimit).map(({ title, href }, index) => (
                  <Link
                    className="group relative flex items-center text-xl font-medium underline-offset-4 transition-colors"
                    href={href}
                    key={`header-desktop-link_${index}`}
                    onMouseEnter={() => setHoveredLink(href)}
                  >
                    {title}
                    {activeHref === href ? (
                      <motion.div
                        layoutId="underline"
                        initial={false}
                        className="absolute bottom-0 left-0 h-0.5 w-full bg-primary"
                      />
                    ) : null}
                  </Link>
                ))}
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
