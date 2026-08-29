import type { Organization, WebSite, WithContext } from "schema-dts";

import { metadata as meta } from "@/app/config";
import { contact } from "@/app/sections/contact/config";

const sameAs = contact.socials
  .map((social) => social.href)
  .filter((href) => !/youtube\.com\/watch/.test(href));

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

export const website: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${meta.site.url}/#website`,
  name: meta.site.title,
  description: meta.site.description,
  url: meta.site.url,
  publisher: { "@id": `${meta.site.url}/#organization` },
};
