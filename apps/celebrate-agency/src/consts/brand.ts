export const BOOKING_EMAIL = "book@celebrate.agency";

// schema.org PostalAddress fields for the agency (single source of truth).
export const AGENCY_ADDRESS = {
  locality: "Seoul",
  country: "KR",
} as const;

// Prebuilt social card served as a static file (public/opengraph-image.png).
// Overrides the shared metadata factory's default "/og" reference so no app
// route is needed to bridge it.
export const OG_IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "Celebrate Agency",
};

// U+2197 NORTH EAST ARROW + U+FE0E text variation selector — forces text
// glyph on iOS Safari, which otherwise renders ↗ as a color emoji.
export const ARROW_NE = "↗︎";
