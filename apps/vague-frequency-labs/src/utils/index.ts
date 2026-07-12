import type { Metadata } from "next";
import { createMetadataFactory } from "@repo/utils/metadata";
import { metadata as meta } from "@/app/config";

export const baseUrl = meta.site.url;

export const createMetadata = createMetadataFactory(meta);

export function ogLocale(locale: string) {
  return locale === "ko" ? "ko_KR" : "en_US";
}

// hreflang alternates — 영어는 flat URL(as-needed prefix), 한국어만 /ko.
// canonical은 현재 locale의 자기 URL을 가리킨다.
export function localeAlternates(
  path: string,
  locale: string,
): Metadata["alternates"] {
  const koPath = path === "/" ? "/ko" : `/ko${path}`;
  return {
    canonical: locale === "ko" ? koPath : path,
    languages: {
      en: path,
      ko: koPath,
      "x-default": path,
    },
  };
}
