export interface HeroCity {
  id: string;
  name: string;
  country: string;
  /** Real club / venue label shown in the pin tooltip. */
  venue: string;
  lat: number;
  lng: number;
}

// Seoul (homeId) is home; the others trace where the sound travels. Coordinates
// are real lon/lat — the dotted map snaps each pin onto its nearest land dot.
const cities: HeroCity[] = [
  { id: "seoul", name: "SEOUL", country: "KR", venue: "HOME BASE", lat: 37.5665, lng: 126.978 },
  { id: "tokyo", name: "TOKYO", country: "JP", venue: "CONTACT", lat: 35.6895, lng: 139.6917 },
  { id: "singapore", name: "SINGAPORE", country: "SG", venue: "ZOUK", lat: 1.3521, lng: 103.8198 },
  { id: "berlin", name: "BERLIN", country: "DE", venue: "BERGHAIN", lat: 52.52, lng: 13.405 },
  { id: "london", name: "LONDON", country: "UK", venue: "FABRIC", lat: 51.5072, lng: -0.1276 },
  { id: "ibiza", name: "IBIZA", country: "ES", venue: "DC-10", lat: 38.9089, lng: 1.4339 },
  { id: "newyork", name: "NEW YORK", country: "US", venue: "BROOKLYN MIRAGE", lat: 40.7128, lng: -74.006 },
  { id: "la", name: "LOS ANGELES", country: "US", venue: "SOUND", lat: 34.0522, lng: -118.2437 },
  { id: "sydney", name: "SYDNEY", country: "AU", venue: "CIVIC UNDERGROUND", lat: -33.8688, lng: 151.2093 },
];

const hero = {
  // Two-line headline; the second line is the outline (stroke) cut.
  headline: { line1: "We are", line2: "Vague Frequency Labs" },
  subline: "FROM SEOUL TO EVERYWHERE — EST. 2025",
  homeId: "seoul",
  cities,
};

export { hero };
