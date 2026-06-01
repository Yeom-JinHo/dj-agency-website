export type Stat = {
  value: string;
  label: string;
  /** Optional superscript mark (e.g. ★) rendered after the value in accent red. */
  superscript?: string;
  /** Animate from 0 with NumberTicker. Off for non-quantitative values (year, city). */
  countUp: boolean;
};

export const stats: Stat[] = [
  { value: "10", label: "Signed artists", superscript: "★", countUp: true },
  { value: "112", label: "Projects shipped", countUp: true },
  { value: "2025", label: "Established", countUp: false },
  { value: "Seoul", label: "Based in", countUp: false },
];
