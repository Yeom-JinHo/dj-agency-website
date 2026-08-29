import type { Organization, WebSite, WithContext } from "schema-dts";

import { metadata as meta } from "@/app/config";

// sameAs는 이 엔티티(Payday Records) 자신의 프로필만 나열한다. 푸터의
// contact.socials는 v.f.labs·아티스트 계정을 섞어 쓰므로 여기서 파생하지 않는다.
const sameAs = ["https://www.instagram.com/paydayrecordsofc/"];

export const organization: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: meta.site.title,
  description: meta.site.description,
  url: meta.site.url,
  logo: `${meta.site.url}/images/logo/400_300/PAYDAY.webp`,
  foundingDate: "2025",
  sameAs,
};

export const website: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: meta.site.title,
  description: meta.site.description,
  url: meta.site.url,
};
