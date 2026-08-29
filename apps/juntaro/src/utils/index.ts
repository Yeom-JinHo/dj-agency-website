import type { Metadata } from "next";

import type { AppMetaConfig } from "@repo/utils/metadata";
import { createMetadataFactory } from "@repo/utils/metadata";
import { getAppUrls } from "@repo/utils/app-urls";

// 실도메인 미확정(2026-08-29 결정). 검색 노출 스위치 — true로 바꾸면 robots·sitemap·
// 페이지 robots 메타가 한꺼번에 열린다. NEXT_PUBLIC_JUNTARO_URL도 함께 설정할 것.
export const indexable: boolean = false;

export const meta: AppMetaConfig = {
  author: {
    name: "ye0m2",
    username: "ye0m2",
    label: "Developer",
  },
  site: {
    title: "Juntaro",
    description: "Tech House producer and DJ based in Seoul.",
    url: getAppUrls().juntaro,
    keywords: ["Juntaro", "Tech House", "DJ", "Seoul"],
    language: "en",
    charset: "UTF-8",
    // app/opengraph-image.png 파일 컨벤션이 서빙하는 라우트.
    ogImage: "/opengraph-image.png",
  },
};

export const baseUrl = meta.site.url;

const factory = createMetadataFactory(meta);

/**
 * 팩토리 결과에 도메인 미확정 잠금을 얹는다. 팩토리는 robots를 항상 index:true로
 * 덮어쓰고, Next는 페이지가 선언한 robots로 레이아웃 값을 다시 덮으므로 잠금은
 * 모든 세그먼트(layout·page)가 공통으로 거치는 이 한 곳에서만 처리한다.
 */
export function createMetadata(override: Metadata): Metadata {
  return {
    ...factory(override),
    ...(indexable ? {} : { robots: { index: false, follow: false } }),
  };
}
