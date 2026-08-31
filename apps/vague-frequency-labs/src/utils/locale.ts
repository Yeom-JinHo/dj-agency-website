import type { Metadata } from "next";

// 클라이언트 컴포넌트(LanguageSwitcher)도 쓰므로 metadata 팩토리·site config와
// 분리해 둔다 — index.ts를 거치면 그것들이 클라 번들에 딸려 들어간다.
export function ogLocale(locale: string) {
  return locale === "ko" ? "ko_KR" : "en_US";
}

// og:locale + og:locale:alternate — Naver/카카오 공유 카드가 참고한다.
export function ogLocales(locale: string) {
  return {
    locale: ogLocale(locale),
    alternateLocale: ogLocale(locale === "ko" ? "en" : "ko"),
  };
}

// locale별 경로 — 영어는 flat URL(as-needed prefix), 한국어만 /ko.
export function localeUrl(path: string, locale: string) {
  if (locale !== "ko") return path;
  return path === "/" ? "/ko" : `/ko${path}`;
}

// 본문이 영어 페이지와 동일한 라우트(번역할 산문이 없음) — /ko 트윈은 내비용으로만
// 존재하고 검색엔 영어 URL 하나만 제출한다: canonical→영어, hreflang·sitemap 제외.
// Google은 언어를 본문으로 판정하므로 같은 본문을 hreflang으로 묶으면 언어 불일치가 된다.
// 번역 본문이 생기면 여기서 빼기만 하면 된다.
const NO_KO_TWIN = new Set(["/artist", "/music", "/video"]);
export const hasKoTwin = (path: string) => !NO_KO_TWIN.has(path);

// 검색엔진에 알리는 정규 URL — ko 트윈이 없는 경로는 locale과 무관하게 영어 flat URL.
export function canonicalPath(path: string, locale: string) {
  return hasKoTwin(path) ? localeUrl(path, locale) : path;
}

// hreflang alternates — canonical은 현재 locale의 자기 URL. ko 트윈이 없으면
// canonical만 영어로 두고 hreflang은 내지 않는다.
export function localeAlternates(
  path: string,
  locale: string
): Metadata["alternates"] {
  if (!hasKoTwin(path)) return { canonical: path };
  return {
    canonical: localeUrl(path, locale),
    languages: {
      en: path,
      ko: localeUrl(path, "ko"),
      "x-default": path,
    },
  };
}
