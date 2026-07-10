/**
 * 픽션 더미 데이터 — 로케일/hydration 비결정성을 피하려 dateLabel을 사전 포맷해 저장한다.
 * (new Date()/toLocale 금지, 표시용 문자열을 그대로 소스로 둔다.)
 */
export const TOUR_DATES = [
  {
    dateLabel: "MAR 14",
    year: "2026",
    city: "SEOUL",
    country: "KR",
    venue: "VURT",
  },
  {
    dateLabel: "APR 04",
    year: "2026",
    city: "TOKYO",
    country: "JP",
    venue: "WOMB",
  },
  {
    dateLabel: "APR 25",
    year: "2026",
    city: "BERLIN",
    country: "DE",
    venue: "TRESOR",
  },
  {
    dateLabel: "MAY 16",
    year: "2026",
    city: "LONDON",
    country: "UK",
    venue: "FABRIC",
  },
  {
    dateLabel: "JUN 06",
    year: "2026",
    city: "AMSTERDAM",
    country: "NL",
    venue: "SHELTER",
  },
  {
    dateLabel: "JUN 27",
    year: "2026",
    city: "BARCELONA",
    country: "ES",
    venue: "INPUT",
  },
  {
    dateLabel: "JUL 18",
    year: "2026",
    city: "NEW YORK",
    country: "US",
    venue: "BASEMENT",
  },
  {
    dateLabel: "AUG 08",
    year: "2026",
    city: "SEOUL",
    country: "KR",
    venue: "FAUST",
  },
] as const;

export type TourDate = (typeof TOUR_DATES)[number];
