import type { Organization, WebSite, WithContext } from "schema-dts";

import { metadata as meta } from "@/app/config";
import { contact } from "@/app/sections/contact/config";

// sameAs should list the entity's own profile pages, so content URLs such as
// a YouTube video are excluded. Confirming the official Payday Records brand
// accounts (vs. the associated v.f.labs / artist pages) remains a follow-up.
const sameAs = contact.socials
  .map((social) => social.href)
  .filter((href) => !/youtube\.com\/watch/.test(href));

export const organization: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: meta.site.title,
  description: meta.site.description,
  url: meta.site.url,
  logo: `${meta.site.url}/images/logo/400_300/PAYDAY.webp`,
  sameAs,
};

export const website: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: meta.site.title,
  description: meta.site.description,
  url: meta.site.url,
};
