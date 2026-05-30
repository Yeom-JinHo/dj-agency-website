import { metadata as meta } from "@/app/config";
import { AGENCY_ADDRESS, BOOKING_EMAIL, SOCIALS } from "@/consts/brand";

/**
 * schema.org Organization JSON-LD for the agency home document.
 * `logo` must be an absolute URL per schema.org.
 */
export function organizationJsonLd() {
  const baseUrl = meta.site.url;

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: meta.site.title,
    url: baseUrl,
    logo: new URL("/icon.png", baseUrl).toString(),
    description: meta.site.description,
    email: BOOKING_EMAIL,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "reservations",
      email: BOOKING_EMAIL,
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: AGENCY_ADDRESS.streetAddress,
      addressLocality: AGENCY_ADDRESS.locality,
      addressCountry: AGENCY_ADDRESS.country,
    },
    sameAs: [SOCIALS.instagram, SOCIALS.youtube],
  };
}
