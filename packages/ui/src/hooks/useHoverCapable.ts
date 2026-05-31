"use client";

import { useSyncExternalStore } from "react";

// A device "has hover" only when the primary pointer can hover with precision
// (mouse/trackpad). Touch devices report `(hover: none)` even on wide tablets,
// so this is the correct signal for hover-only affordances — width is just a
// proxy and misfires on landscape tablets / narrow desktop windows.
const QUERY = "(hover: hover) and (pointer: fine)";

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

export function useHoverCapable(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    // SSR: assume no hover so hover-only UI is omitted server-side; capable
    // devices reveal it after hydration (no layout shift — it's hover-gated).
    () => false,
  );
}
