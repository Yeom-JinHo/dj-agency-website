import { SOCIALS } from "@/consts/socials";
import { meta } from "@/utils";

// sameAs는 아티스트 본인의 프로필 페이지만 — consts/socials.ts 5개가 전부 프로필 URL.
const sameAs = SOCIALS.map((social) => social.href);

export const musicGroup = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  "@id": `${meta.site.url}/#artist`,
  name: meta.site.title,
  description: meta.site.description,
  url: meta.site.url,
  image: `${meta.site.url}/images/profile.webp`,
  genre: "Tech House",
  foundingLocation: {
    "@type": "Place",
    name: "Seoul, South Korea",
  },
  sameAs,
};

export const website = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: meta.site.title,
  description: meta.site.description,
  url: meta.site.url,
  publisher: { "@id": `${meta.site.url}/#artist` },
};
