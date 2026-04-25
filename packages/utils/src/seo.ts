type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface SitemapEntry {
  url: string;
  lastModified?: string | Date;
  changeFrequency?: ChangeFrequency;
  priority?: number;
}

export interface SitemapRouteInput {
  path: string;
  changeFrequency?: ChangeFrequency;
  priority?: number;
  lastModified?: string | Date;
}

export interface CreateSitemapOptions {
  baseUrl: string;
  routes: SitemapRouteInput[];
}

function joinUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/$/, "");
  if (path === "/" || path === "") return normalizedBase || "/";
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

export function createSitemap({
  baseUrl,
  routes,
}: CreateSitemapOptions): SitemapEntry[] {
  const now = new Date();
  return routes.map((route) => ({
    url: joinUrl(baseUrl, route.path),
    lastModified: route.lastModified ?? now,
    changeFrequency: route.changeFrequency ?? "monthly",
    priority:
      route.priority ?? (route.path === "/" || route.path === "" ? 1 : 0.7),
  }));
}

export interface RobotsRule {
  userAgent: string | string[];
  allow?: string | string[];
  disallow?: string | string[];
}

export interface RobotsOutput {
  rules: RobotsRule | RobotsRule[];
  sitemap?: string | string[];
  host?: string;
}

export interface CreateRobotsOptions {
  baseUrl: string;
  /** When false, output blocks all crawlers (preview/staging). */
  isProduction?: boolean;
}

export function createRobots({
  baseUrl,
  isProduction = true,
}: CreateRobotsOptions): RobotsOutput {
  const normalizedBase = baseUrl.replace(/\/$/, "");

  if (!isProduction) {
    return {
      rules: { userAgent: "*", disallow: "/" },
      host: normalizedBase,
    };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${normalizedBase}/sitemap.xml`,
    host: normalizedBase,
  };
}
