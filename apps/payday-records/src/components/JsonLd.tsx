import type { Organization, WebSite, WithContext } from "schema-dts";

import { metadata as meta } from "@/app/config";
import { contact } from "@/app/sections/contact/config";

// JSON.stringify does not escape HTML-significant characters, so a value
// containing "</script>" could break out of the JSON-LD block. Inputs are
// static today, but escaping < > & keeps this safe if the data ever becomes
// dynamic (e.g. sourced from a CMS or user input).
function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/[<>&]/g, (char) => {
    switch (char) {
      case "<":
        return "\\u003c";
      case ">":
        return "\\u003e";
      case "&":
        return "\\u0026";
      default:
        return char;
    }
  });
}

// sameAs should list the entity's own profile pages, so content URLs such as
// a YouTube video are excluded. Confirming the official Payday Records brand
// accounts (vs. the associated v.f.labs / artist pages) remains a follow-up.
const sameAs = contact.socials
  .map((social) => social.href)
  .filter((href) => !/youtube\.com\/watch/.test(href));

const organization: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: meta.site.title,
  description: meta.site.description,
  url: meta.site.url,
  logo: `${meta.site.url}/images/logo/400_300/PAYDAY.png`,
  sameAs,
};

const website: WithContext<WebSite> = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: meta.site.title,
  description: meta.site.description,
  url: meta.site.url,
};

export function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(website) }}
      />
    </>
  );
}
