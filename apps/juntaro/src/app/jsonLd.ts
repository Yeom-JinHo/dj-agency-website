import type { MusicGroup, WebSite, WithContext } from "schema-dts";

import { metadata as meta } from "@/app/config";
import { SOCIALS } from "@/consts/socials";

// YouTube watch URLs point at a single video, not the artist entity, so they
// are excluded from sameAs (which must reference the same person/act).
const sameAs = SOCIALS.map((social) => social.href).filter(
  (href) => !/youtube\.com\/watch/.test(href),
);

export const musicGroup: WithContext<MusicGroup> = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: meta.site.title,
  description: meta.site.description,
  url: meta.site.url,
  logo: `${meta.site.url}/images/logo.webp`,
  image: `${meta.site.url}/images/profile.webp`,
  genre: ["Tech House", "House", "Electronic"],
  sameAs,
};

export const website: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: meta.site.title,
  description: meta.site.description,
  url: meta.site.url,
};
