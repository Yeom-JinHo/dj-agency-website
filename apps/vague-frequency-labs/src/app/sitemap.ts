import type { MetadataRoute } from "next";
import { getArtists } from "@repo/content/queries";
import { VFL_SITE } from "@/utils/content-adapters";
import { baseUrl } from "@/utils";

// lastModified is intentionally omitted: a near-static site would otherwise
// stamp every URL with the build time on each deploy, which trains crawlers to
// distrust the lastmod signal. /intro is excluded — it is a noindex gate page,
// so listing it here would contradict its robots meta.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const artists = await getArtists(VFL_SITE);
  const artistEntries: MetadataRoute.Sitemap = artists.map((artist) => ({
    url: `${baseUrl}/artist/${encodeURIComponent(artist.slug)}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...artistEntries];
}
