import type { MetadataRoute } from "next";

import { baseUrl } from "@/utils";

// Routes are enumerated explicitly so the sitemap never includes not-found.tsx
// or route-group internals. Add new public routes here as the site grows.
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${baseUrl}/`,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/intro`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
