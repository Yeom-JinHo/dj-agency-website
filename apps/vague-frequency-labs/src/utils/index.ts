import type { Metadata } from "next";
import { createMetadataFactory } from "@repo/utils/metadata";
import { metadata as meta } from "@/app/config";

export const baseUrl = meta.site.url;

export const createMetadata = createMetadataFactory(meta);

export function ogLocale(locale: string) {
  return locale === "ko" ? "ko_KR" : "en_US";
}

// locale별 경로 — 영어는 flat URL(as-needed prefix), 한국어만 /ko.
export function localeUrl(path: string, locale: string) {
  if (locale !== "ko") return path;
  return path === "/" ? "/ko" : `/ko${path}`;
}

// hreflang alternates — canonical은 현재 locale의 자기 URL을 가리킨다.
export function localeAlternates(
  path: string,
  locale: string,
): Metadata["alternates"] {
  return {
    canonical: localeUrl(path, locale),
    languages: {
      en: path,
      ko: localeUrl(path, "ko"),
      "x-default": path,
    },
  };
}
