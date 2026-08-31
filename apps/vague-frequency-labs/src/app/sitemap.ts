import type { MetadataRoute } from "next";
import { getArtists } from "@repo/content/queries";
import { routing } from "@/i18n/routing";
import { VFL_SITE } from "@/utils/content-adapters";
import { baseUrl, hasKoTwin, localeUrl } from "@/utils";

// lastModified is intentionally omitted: a near-static site would otherwise
// stamp every URL with the build time on each deploy, which trains crawlers to
// distrust the lastmod signal. /intro is excluded — it is a noindex gate page,
// so listing it here would contradict its robots meta.
//
// 두 locale 모두 <loc>으로 제출한다 — proxy의 alternateLinks(Link 헤더)를 껐으므로
// /ko/*의 발견 경로가 영어 페이지의 <link rel="alternate">뿐이면 색인이 늦어진다.
function entries(path: string, priority: number): MetadataRoute.Sitemap {
  const en = `${baseUrl}${path === "/" ? "" : path}`;
  // 번역 본문이 없는 라우트(hasKoTwin=false)는 영어 URL만 — 페이지 canonical과 일치.
  if (!hasKoTwin(path))
    return [{ url: en, changeFrequency: "monthly", priority }];
  const ko = `${baseUrl}${localeUrl(path, "ko")}`;
  return routing.locales.map((locale) => ({
    url: locale === "ko" ? ko : en,
    changeFrequency: "monthly",
    priority,
    alternates: { languages: { en, ko, "x-default": en } },
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "/",
    "/about",
    "/artist",
    "/music",
    "/video",
    "/contact",
  ];

  const staticEntries = staticPaths.flatMap((path) =>
    entries(path, path === "/" ? 1 : 0.8)
  );

  const artists = await getArtists(VFL_SITE);
  const artistEntries = artists.flatMap((artist) =>
    entries(`/artist/${encodeURIComponent(artist.slug)}`, 0.6)
  );

  return [...staticEntries, ...artistEntries];
}
