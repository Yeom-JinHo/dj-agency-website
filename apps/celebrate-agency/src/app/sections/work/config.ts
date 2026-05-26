export type WorkCase = {
  id: string;
  title: string;
  credit: string;
  date: string;
  label: string;
  tag: string;
  spanClassName: string;
  aspectClassName: string;
};

export const workCases: WorkCase[] = [
  {
    id: "loozbone-asia",
    title: "Asia Tour 2025 — Loozbone",
    credit: "DJ. Loozbone",
    date: "Q3 · 2025",
    label: "[ tour reel · 16:10 ]",
    tag: "▍ TOUR",
    spanClassName: "lg:col-span-7",
    aspectClassName: "aspect-[16/10]",
  },
  {
    id: "dearboi-muse",
    title: "MUSE — Resident Series",
    credit: "DJ. DearBoi",
    date: "2025 —",
    label: "[ residency · 4:3 ]",
    tag: "▍ RESIDENCY",
    spanClassName: "lg:col-span-5",
    aspectClassName: "aspect-[4/3]",
  },
  {
    id: "sielo-inrotation",
    title: "In/Rotation — Sielo",
    credit: "DJ. Sielo",
    date: "Q4 · 2025",
    label: "[ ep · 4:3 ]",
    tag: "▍ RELEASE",
    spanClassName: "lg:col-span-5",
    aspectClassName: "aspect-[4/3]",
  },
  {
    id: "juntaro-beatport",
    title: "Beatport Top 10 — Juntaro",
    credit: "DJ. Juntaro",
    date: "Q2 · 2025",
    label: "[ chart · 16:10 ]",
    tag: "▍ CHART",
    spanClassName: "lg:col-span-7",
    aspectClassName: "aspect-[16/10]",
  },
];
