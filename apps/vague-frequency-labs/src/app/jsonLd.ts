import type { Organization, WebSite, WithContext } from "schema-dts";

import { metadata as meta } from "@/app/config";
import { contact } from "@/app/sections/contact/config";

// sameAs는 엔티티의 프로필 페이지여야 한다 — 특정 영상(watch) 딥링크는 제외.
// Organization·MusicGroup 양쪽이 같은 기준을 쓴다.
export const isProfileUrl = (href: string) => !/youtube\.com\/watch/.test(href);

const sameAs = contact.socials
  .map((social) => social.href)
  .filter(isProfileUrl);

export const organization: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${meta.site.url}/#organization`,
  name: meta.site.title,
  description: meta.site.description,
  url: meta.site.url,
  logo: `${meta.site.url}/images/logo/VFLABS.webp`,
  sameAs,
  founder: {
    "@type": "Person",
    name: "Sam Hong",
  },
  foundingDate: "2025",
  knowsAbout: [
    "Electronic Music",
    "Tech House",
    "Bass House",
    "Music Production",
    "Sound Design",
  ],
};

// WebSite도 Organization처럼 @id 단일 엔티티 — locale별로 다른 값을 같은 @id에
// 선언하면 그래프 병합 시 충돌하므로 영문 고정 + inLanguage로 지원 언어만 선언한다.
export const website: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${meta.site.url}/#website`,
  name: meta.site.title,
  description: meta.site.description,
  url: meta.site.url,
  inLanguage: ["en", "ko"],
  publisher: { "@id": `${meta.site.url}/#organization` },
};
