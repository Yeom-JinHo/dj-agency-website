import { metadata as meta } from "@/app/config";
import { AGENCY_ADDRESS, BOOKING_EMAIL, SOCIALS } from "@/consts/brand";

/**
 * schema.org Organization JSON-LD for the agency home document.
 * `logo` must be an absolute URL per schema.org.
 * ProfessionalService는 schema.org 비권장 + LocalBusiness 하위(telephone·openingHours
 * 요구)라 Organization 유지 — 서비스 3종은 hasOfferCatalog로 명시한다.
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
    // Founding year — matches the "Established 2025" stat and sibling brands.
    foundingDate: "2025",
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
    areaServed: "KR",
    // 홈 hero/footer의 "Talent · Production · Direction" 3종을 서비스 엔티티로 명시.
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Services",
      itemListElement: ["Talent booking", "Production", "Direction"].map(
        (name) => ({
          "@type": "Offer",
          itemOffered: { "@type": "Service", name },
        })
      ),
    },
    sameAs: [SOCIALS.instagram, SOCIALS.youtube],
  };
}
