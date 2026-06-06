"use client";

import dynamic from "next/dynamic";

// MacBookScroll is a heavy (~660-line) scroll-driven client component that sits
// below the fold in the Contact section. Lazy-load it with ssr:false so it stays
// out of the initial bundle while the surrounding Contact markup (email/socials)
// keeps server-rendering. The server-component Contact can't call dynamic({ssr:false})
// directly, so this thin client wrapper owns the boundary.
export const MacBookScroll = dynamic(
  () => import("@/components/MacBookScroll").then((m) => m.MacBookScroll),
  { ssr: false }
);
