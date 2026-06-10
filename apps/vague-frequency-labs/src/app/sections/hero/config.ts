export interface HeroCity {
  id: string;
  name: string;
  /** Country label shown in the tooltip UI. */
  displayCountry: string;
  /** ISO 3166-1 alpha-2 used for external flag assets. */
  flagCountryCode: string;
  /** Real club / venue label shown in the pin tooltip. */
  venue: string;
  lat: number;
  lng: number;
}

// Seoul (homeId) is home; the others trace where the sound travels. Coordinates
// are real lon/lat — the dotted map snaps each pin onto its nearest land dot.
const cities: HeroCity[] = [
  { id: "seoul", name: "SEOUL", displayCountry: "KR", flagCountryCode: "KR", venue: "HOME BASE", lat: 37.5665, lng: 126.978 },
  { id: "tokyo", name: "TOKYO", displayCountry: "JP", flagCountryCode: "JP", venue: "CONTACT", lat: 35.6895, lng: 139.6917 },
  { id: "singapore", name: "SINGAPORE", displayCountry: "SG", flagCountryCode: "SG", venue: "ZOUK", lat: 1.3521, lng: 103.8198 },
  { id: "berlin", name: "BERLIN", displayCountry: "DE", flagCountryCode: "DE", venue: "BERGHAIN", lat: 52.52, lng: 13.405 },
  { id: "london", name: "LONDON", displayCountry: "UK", flagCountryCode: "GB", venue: "FABRIC", lat: 51.5072, lng: -0.1276 },
  { id: "ibiza", name: "IBIZA", displayCountry: "ES", flagCountryCode: "ES", venue: "DC-10", lat: 38.9089, lng: 1.4339 },
  { id: "newyork", name: "NEW YORK", displayCountry: "US", flagCountryCode: "US", venue: "BROOKLYN MIRAGE", lat: 40.7128, lng: -74.006 },
  { id: "la", name: "LOS ANGELES", displayCountry: "US", flagCountryCode: "US", venue: "SOUND", lat: 34.0522, lng: -118.2437 },
  { id: "sydney", name: "SYDNEY", displayCountry: "AU", flagCountryCode: "AU", venue: "CIVIC UNDERGROUND", lat: -33.8688, lng: 151.2093 },
];

const hero = {
  // Two-line headline; the second line is the outline (stroke) cut.
  headline: { line1: "We are", line2: "Vague Frequency Labs" },
  subline: "FROM SEOUL TO EVERYWHERE · EST. 2025",
  homeId: "seoul",
  cities,
};

export { hero };
