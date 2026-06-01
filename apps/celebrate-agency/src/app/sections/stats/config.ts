export type Stat = {
  value: string;
  label: string;
  /** Animate from 0 with NumberTicker. Off for non-quantitative values (year, city). */
  countUp: boolean;
};

export const stats: Stat[] = [
  { value: "6", label: "Signed artists", countUp: true },
  { value: "112", label: "Projects shipped", countUp: true },
  { value: "6", label: "Years on the wall", countUp: true },
  { value: "Seoul", label: "Based in", countUp: false },
];
