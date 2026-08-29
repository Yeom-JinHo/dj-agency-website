import type { Metadata } from "next";

import type { AppMetaConfig } from "@repo/utils/metadata";
import { createMetadataFactory } from "@repo/utils/metadata";
import { getAppUrls } from "@repo/utils/app-urls";

// 실도메인 미확정(2026-08-29 결정). env가 비어 있으면 localhost 폴백으로 빌드는 되지만
// 검색 노출은 막아야 하므로 아래 `indexable`이 layout의 robots를 noindex로 잠근다.
export const indexable = Boolean(process.env.NEXT_PUBLIC_JUNTARO_URL);

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
