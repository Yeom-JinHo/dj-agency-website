import { SectionHead } from "@/components/SectionHead";

type Case = {
  id: string;
  title: string;
  credit: string;
  date: string;
  lbl: string;
  tag: string;
  spanCls: string;
  aspectCls: string;
};

const CASES: Case[] = [
  {
    id: "loozbone-asia",
    title: "Asia Tour 2025 — Loozbone",
    credit: "DJ. Loozbone",
    date: "Q3 · 2025",
    lbl: "[ tour reel · 16:10 ]",
    tag: "▍ TOUR",
    spanCls: "lg:col-span-7",
    aspectCls: "aspect-[16/10]",
  },
  {
    id: "dearboi-muse",
    title: "MUSE — Resident Series",
    credit: "DJ. DearBoi",
    date: "2025 —",
    lbl: "[ residency · 4:3 ]",
    tag: "▍ RESIDENCY",
    spanCls: "lg:col-span-5",
    aspectCls: "aspect-[4/3]",
  },
  {
    id: "sielo-inrotation",
    title: "In/Rotation — Sielo",
    credit: "DJ. Sielo",
    date: "Q4 · 2025",
    lbl: "[ ep · 4:3 ]",
    tag: "▍ RELEASE",
    spanCls: "lg:col-span-5",
    aspectCls: "aspect-[4/3]",
  },
  {
    id: "juntaro-beatport",
    title: "Beatport Top 10 — Juntaro",
    credit: "DJ. Juntaro",
    date: "Q2 · 2025",
    lbl: "[ chart · 16:10 ]",
    tag: "▍ CHART",
    spanCls: "lg:col-span-7",
    aspectCls: "aspect-[16/10]",
  },
];

export default function Work() {
  return (
    <section
      id="work"
      className="border-t border-ca-line py-20 lg:py-[120px]"
    >
      <SectionHead
        num="03"
        numLabel="SELECTED WORK"
        title="Work"
        aside={
          <>
            Last 12 months.
            <br />
            Archive on request.
          </>
        }
      />
      <div className="grid grid-cols-1 gap-6 px-10 lg:grid-cols-12">
        {CASES.map((c) => (
          <a
            key={c.id}
            href="#"
            className={`relative cursor-pointer ${c.spanCls}`}
          >
            <div
              className={`ca-stripe-ph-lg relative overflow-hidden border border-ca-line ${c.aspectCls}`}
            >
              <span className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ca-muted">
                {c.lbl}
              </span>
              <span className="absolute top-4 right-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ca-red">
                {c.tag}
              </span>
            </div>
            <div className="flex items-end justify-between pt-4">
              <h4 className="font-display text-3xl uppercase leading-none tracking-[0.01em]">
                {c.title}
              </h4>
              <div className="text-right font-mono text-[11px] uppercase tracking-[0.1em] text-ca-muted">
                {c.credit}
                <br />
                {c.date}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
