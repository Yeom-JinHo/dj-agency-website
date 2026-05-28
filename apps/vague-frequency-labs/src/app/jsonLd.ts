import type { Organization, WebSite, WithContext } from "schema-dts";

import { metadata as meta } from "@/app/config";
import { contact } from "@/app/sections/contact/config";

const sameAs = contact.socials
  .map((social) => social.href)
  .filter((href) => !/youtube\.com\/watch/.test(href));

export const organization: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: meta.site.title,
  description: meta.site.description,
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

export const website: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: meta.site.title,
  description: meta.site.description,
  url: meta.site.url,
};
