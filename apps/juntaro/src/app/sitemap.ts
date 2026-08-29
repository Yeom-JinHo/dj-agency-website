import type { MetadataRoute } from "next";

import { baseUrl, indexable } from "@/utils";

// 라우트는 명시 열거 — not-found 등이 섞이지 않도록. lastModified는 생략(VFL과 동일:
// 정적 사이트가 배포마다 빌드 시각을 찍으면 크롤러가 lastmod 신호를 불신한다).
export default function sitemap(): MetadataRoute.Sitemap {
  // 도메인 확정 전엔 localhost 폴백 URL이 실려 나가므로 빈 사이트맵을 낸다(robots도 차단 중).
  if (!indexable) return [];
  return [
    { url: baseUrl, changeFrequency: "monthly", priority: 1 },
    { url: `${baseUrl}/music`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/tour`, changeFrequency: "weekly", priority: 0.8 },
  ];
}
