import type { MetadataRoute } from "next";
import { artistProfile } from "@/source";
import { baseUrl } from "@/utils";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPaths = [
    "/",
    "/about",
    "/artist",
    "/music",
    "/video",
    "/contact",
    "/intro",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${baseUrl}${path === "/" ? "" : path}`,
    lastModified,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.8,
  }));

  const artistEntries: MetadataRoute.Sitemap = artistProfile
    .getPages()
    .map((artist) => ({
      url: `${baseUrl}/artist/${encodeURIComponent(artist.name)}`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  return [...staticEntries, ...artistEntries];
}
