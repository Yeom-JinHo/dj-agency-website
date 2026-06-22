export const BOOKING_EMAIL = "book@celebrate.agency";

// Prefilled booking enquiry. Subject + a fill-in-the-blank body so the mail
// client opens ready for the client to complete. Single source for every
// booking mailto link (footer, RosterFiller) — keep them reading from here.
const BOOKING_SUBJECT = "Booking Inquiry — Celebrate Agency";
const BOOKING_BODY = [
  "Name / Company:",
  "Artist(s):",
  "Project type:",
  "Preferred date(s):",
  "Budget:",
  "Details:",
].join("\r\n");

export const BOOKING_MAILTO = `mailto:${BOOKING_EMAIL}?subject=${encodeURIComponent(
  BOOKING_SUBJECT,
)}&body=${encodeURIComponent(BOOKING_BODY)}`;

// schema.org PostalAddress fields for the agency (single source of truth).
export const AGENCY_ADDRESS = {
  streetAddress: "38 Seongsui-ro, Seongdong-gu",
  locality: "Seoul",
  country: "KR",
} as const;

// schema.org sameAs targets — used in Organization JSON-LD and rendered in
// the footer. Keep both consumers reading from this single source.
export const SOCIALS = {
  instagram: "https://www.instagram.com/ye0m_2/",
  youtube: "https://www.youtube.com/@ye0m_2",
} as const;

// U+2197 NORTH EAST ARROW + U+FE0E text variation selector — forces text
// glyph on iOS Safari, which otherwise renders ↗ as a color emoji.
export const ARROW_NE = "↗︎";
