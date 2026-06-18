import type { MetadataRoute } from "next";

import { metadata as meta } from "@/app/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = meta.site.url;

  // Single-page portal: only the root entry. lastModified is intentionally
  // omitted so deploys don't stamp build time onto the URL and erode crawler
  // trust in the lastmod signal.
  return [
    {
      url: baseUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
