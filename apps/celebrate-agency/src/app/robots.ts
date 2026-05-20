import type { MetadataRoute } from "next";

import { metadata as meta } from "@/app/config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = meta.site.url;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
