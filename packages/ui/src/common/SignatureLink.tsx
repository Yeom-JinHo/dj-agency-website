"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type CSSProperties, type ReactNode } from "react";

import { useHoverCapable } from "../hooks/useHoverCapable";
import { cn } from "../index";

// U+2197 + U+FE0E text variation selector — forces the text glyph on iOS
// Safari, which otherwise renders ↗ as a color emoji.
const ARROW_NE = "↗︎";

type SignatureLinkProps = {
  /** Destination URL (opens in a new tab). */
  href: string;
  /** The visible handle text, e.g. "ye0m2". */
  children: ReactNode;
  /** Tooltip copy shown on hover/focus. Defaults to "Connect me". */
  label?: string;
  /** Accessible name for the link. Should include the visible handle (WCAG 2.5.3). */
  ariaLabel?: string;
  /** Base classes for the link text (resting state). */
  className?: string;
  /** Accent classes applied to the active link + tooltip (e.g. "text-ca-red"). */
  accentClassName?: string;
  /** Typographic overrides for the tooltip so each app can match its own tone. */
  tooltipClassName?: string;
};

/**
 * A footer signature that turns a handle (e.g. "ye0m2") into an Instagram link.
 * On hover-capable devices, hovering or keyboard-focusing reveals a
 * "Connect me ↗" tooltip (the easter egg) and an animated underline; on touch
 * devices the tooltip is skipped and a tap navigates straight to the link.
 * Accent color adapts per app via `accentClassName`.
 */
export default function SignatureLink({
  href,
  children,
  label = "Connect me",
  ariaLabel = "Connect on Instagram",
  className,
  accentClassName,
  tooltipClassName,
}: SignatureLinkProps) {
  const hoverCapable = useHoverCapable();
  const reduceMotion = useReducedMotion();
  // Driven by both pointer (hover) and keyboard (focus) so the affordance is
  // equal for both — keyboard users see the underline + tooltip too.
  const [active, setActive] = useState(false);

  // Animated underline via background-size so its timing syncs with the tooltip
  // (plain `hover:underline` is an instant toggle and visibly desyncs). Inline
  // style keeps it independent of Tailwind v4 gradient-utility naming.
  const underlineStyle: CSSProperties = {
    backgroundImage: "linear-gradient(currentColor, currentColor)",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "0 100%",
    backgroundSize: active ? "100% 1px" : "0% 1px",
  };

  return (
    <span className="relative inline-flex">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onFocus={() => setActive(true)}
        onBlur={() => setActive(false)}
        style={underlineStyle}
        className={cn(
          "relative pb-px transition-[background-size,color] duration-200 ease-out",
          active && accentClassName,
          className,
        )}
      >
        {children}
      </a>

      {hoverCapable && (
        <AnimatePresence>
          {active && (
            <motion.span
              aria-hidden
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
              transition={{
                duration: reduceMotion ? 0.12 : 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={cn(
                "pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2",
                "rounded-md border border-current/40 bg-current/10 px-2.5 py-1",
                "shadow-[0_4px_16px_rgba(0,0,0,0.12)] backdrop-blur-sm",
                "text-[11px] font-medium tracking-[0.1em] whitespace-nowrap",
                accentClassName,
                tooltipClassName,
              )}
            >
              {label} {ARROW_NE}
              <span className="absolute top-full left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-[60%] rotate-45 border-r border-b border-current/40 bg-current/10" />
            </motion.span>
          )}
        </AnimatePresence>
      )}
    </span>
  );
}
