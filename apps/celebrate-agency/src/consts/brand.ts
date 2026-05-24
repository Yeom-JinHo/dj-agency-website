export const BOOKING_EMAIL = "book@celebrate.agency";

// schema.org PostalAddress fields for the agency (single source of truth).
export const AGENCY_ADDRESS = {
  locality: "Seoul",
  country: "KR",
} as const;

// U+2197 NORTH EAST ARROW + U+FE0E text variation selector — forces text
// glyph on iOS Safari, which otherwise renders ↗ as a color emoji.
export const ARROW_NE = "↗︎";
