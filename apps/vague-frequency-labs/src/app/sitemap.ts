import type { MetadataRoute } from "next";
import { artistProfile } from "@/source";
import { baseUrl } from "@/utils";

// lastModified is intentionally omitted: a near-static site would otherwise
// stamp every URL with the build time on each deploy, which trains crawlers to
// distrust the lastmod signal. /intro is excluded — it is a noindex gate page,
// so listing it here would contradict its robots meta.
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "/",
    "/about",
    "/artist",
    "/music",
    "/video",
    "/contact",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${baseUrl}${path === "/" ? "" : path}`,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));

  const artistEntries: MetadataRoute.Sitemap = artistProfile
    .getPages()
    .map((artist) => ({
      url: `${baseUrl}/artist/${encodeURIComponent(artist.name)}`,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...staticEntries, ...artistEntries];
}
