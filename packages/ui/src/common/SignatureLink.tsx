import type { ReactNode } from "react";

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
  /** Link styling, including any literal `hover:`/`focus-visible:` color classes. */
  className?: string;
  /** Tooltip color + typographic tone (per-app). */
  tooltipClassName?: string;
};

/**
 * A footer signature that turns a handle (e.g. "ye0m2") into an Instagram link.
 * On hover-capable devices, hovering or keyboard-focusing reveals a
 * "Connect me ↗" tooltip (the easter egg) and an animated underline; touch
 * devices skip the tooltip (gated by `@media (hover: hover)`) and a tap
 * navigates straight to the link.
 *
 * Pure CSS — no client JS. The tooltip is always in the DOM (aria-hidden,
 * pointer-events-none) and revealed via Tailwind `peer-hover`/`peer-focus-visible`
 * variants, so this renders as a server component.
 */
export default function SignatureLink({
  href,
  children,
  label = "Connect me",
  ariaLabel = "Connect on Instagram",
  className,
  tooltipClassName,
}: SignatureLinkProps) {
  return (
    <span className="relative inline-block">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={ariaLabel}
        className={cn(
          // Animated underline via background-size (kept in classes so the
          // hover/focus variants can override it — inline style would win).
          "peer pb-px bg-[image:linear-gradient(currentColor,currentColor)] bg-[position:0_100%] bg-[length:0%_1px] bg-no-repeat",
          "transition-[background-size,color] duration-200 ease-out motion-reduce:transition-none",
          "hover:bg-[length:100%_1px] focus-visible:bg-[length:100%_1px]",
          className,
        )}
      >
        {children}
      </a>

      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 translate-y-1 opacity-0",
          "rounded-md border border-current/40 bg-current/10 px-2.5 py-1",
          "shadow-[0_4px_16px_rgba(0,0,0,0.12)] backdrop-blur-sm",
          "text-[11px] font-medium tracking-[0.1em] whitespace-nowrap",
          "transition duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none",
          "peer-focus-visible:translate-y-0 peer-focus-visible:opacity-100",
          "[@media(hover:hover)]:peer-hover:translate-y-0 [@media(hover:hover)]:peer-hover:opacity-100",
          tooltipClassName,
        )}
      >
        {label} {ARROW_NE}
        <span className="absolute top-full left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-[60%] rotate-45 border-r border-b border-current/40 bg-current/10" />
      </span>
    </span>
  );
}
