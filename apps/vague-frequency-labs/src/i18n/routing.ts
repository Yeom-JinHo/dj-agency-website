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
});
