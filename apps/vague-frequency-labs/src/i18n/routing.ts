import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "ko"],
  defaultLocale: "en",
  // 영어는 기존 flat URL 그대로, 한국어만 /ko prefix.
  localePrefix: "as-needed",
  // 자동 감지를 켜면 ko 쿠키/Accept-Language 사용자의 영어 URL 접근이
  // /ko로 리다이렉트된다 — "영어 URL 무리다이렉트" 수용 기준과 양립 불가라 끈다.
  // 언어 전환은 헤더 스위처로만 한다.
  localeDetection: false,
  // 감지가 꺼져 있으니 locale 쿠키는 읽히지 않는다 — 쓰지도 않는다.
  localeCookie: false,
  // hreflang은 페이지 metadata(localeAlternates)가 단일 소스 — Link 헤더 중복 송출 방지.
  alternateLinks: false,
});
