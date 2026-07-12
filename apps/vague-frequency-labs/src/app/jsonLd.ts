import type { Organization, WebSite, WithContext } from "schema-dts";

import { metadata as meta } from "@/app/config";
import { contact } from "@/app/sections/contact/config";

const sameAs = contact.socials
  .map((social) => social.href)
  .filter((href) => !/youtube\.com\/watch/.test(href));

// description은 locale별 번역(Metadata.home.description)을 주입받는다.
// Organization은 schema.org상 inLanguage 속성이 없어 description만 번역한다.
export function getOrganization(
  description: string,
): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: meta.site.title,
    description,
    url: meta.site.url,
    logo: `${meta.site.url}/images/logo/VFLABS.webp`,
    sameAs,
    founder: {
      "@type": "Person",
      name: "Vague Frequency Laboratory Team",
    },
    foundingDate: "2025",
    knowsAbout: [
      "Electronic Music",
      "Experimental Music",
      "Music Production",
      "Sound Design",
      "Audio Engineering",
      "Ambient Music",
      "IDM",
    ],
  };
}

export function getWebsite(
  description: string,
  locale: string,
): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: meta.site.title,
    description,
    url: meta.site.url,
    inLanguage: locale,
  };
}
