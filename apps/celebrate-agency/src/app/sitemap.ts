import type { MetadataRoute } from "next";

import { metadata as meta } from "@/app/config";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = meta.site.url;
  const lastModified = new Date();

  return [
    {
      url: baseUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/intro`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];
}
