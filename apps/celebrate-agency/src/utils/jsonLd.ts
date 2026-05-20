import { metadata as meta } from "@/app/config";
import { AGENCY_ADDRESS, BOOKING_EMAIL } from "@/consts/brand";

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
      addressLocality: AGENCY_ADDRESS.locality,
      addressCountry: AGENCY_ADDRESS.country,
    },
  };
}

// U+2028/U+2029 are valid in JSON strings but break out of an HTML <script>.
const LINE_SEPARATOR = String.fromCharCode(0x2028);
const PARAGRAPH_SEPARATOR = String.fromCharCode(0x2029);

/**
 * Serialize a JSON-LD object for safe injection via `dangerouslySetInnerHTML`.
 * `JSON.stringify` does not escape `<`, `>`, `&`, or the U+2028/U+2029 line
 * separators, so a `</script>` (or those chars) in any field could break out
 * of the script element. Inputs are static today, but this keeps the sink safe
 * if a field ever becomes dynamic.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .split(LINE_SEPARATOR)
    .join("\\u2028")
    .split(PARAGRAPH_SEPARATOR)
    .join("\\u2029");
}
