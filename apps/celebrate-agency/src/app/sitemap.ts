import type { MetadataRoute } from "next";

import { metadata as meta } from "@/app/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = meta.site.url;

  // lastModified is intentionally omitted: a near-static marketing site would
  // otherwise stamp every URL with the build time on each deploy, which trains
  // crawlers to distrust the lastmod signal.
  return [
    {
      url: baseUrl,
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
