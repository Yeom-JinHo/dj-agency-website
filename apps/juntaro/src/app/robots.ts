import type { MetadataRoute } from "next";

import { baseUrl, indexable } from "@/utils";

// 도메인 확정 전엔 전체 차단 — 임시 도메인으로 인덱스되면 이후 301 비용이 든다.
export default function robots(): MetadataRoute.Robots {
  if (!indexable) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
