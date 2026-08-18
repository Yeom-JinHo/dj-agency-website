import type { MetadataRoute } from "next";

import { metadata as meta } from "@/app/config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = meta.site.url;

  // Brand-neutral public portal (front-door): indexing is allowed so the
  // gateway can be discovered, unlike the brand sites' /intro gate pages.
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
