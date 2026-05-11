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
    id: "aera",
    title: "Pre-Season — Aera Skin",
    credit: "DIR. Yuna Park",
    date: "Q1 · 2026",
    lbl: "[ campaign film · 16:10 ]",
    tag: "▍ FILM",
    spanCls: "lg:col-span-7",
    aspectCls: "aspect-[16/10]",
  },
  {
    id: "quarterly",
    title: "Issue 04, Quarterly",
    credit: "PH. Mateo Ruiz",
    date: "Q1 · 2026",
    lbl: "[ editorial · 4:3 ]",
    tag: "▍ PRINT",
    spanCls: "lg:col-span-5",
    aspectCls: "aspect-[4/3]",
  },
  {
    id: "noor",
    title: "Noor — Tour 2025",
    credit: "CD. Kojiro Sato",
    date: "Q4 · 2025",
    lbl: "[ live event · 4:3 ]",
    tag: "▍ LIVE",
    spanCls: "lg:col-span-5",
    aspectCls: "aspect-[4/3]",
  },
  {
    id: "hando",
    title: "Make / Believe — Hando",
    credit: "DIR. Adaeze O.",
    date: "Q3 · 2025",
    lbl: "[ brand film · 16:10 ]",
    tag: "▍ FILM",
    spanCls: "lg:col-span-7",
    aspectCls: "aspect-[16/10]",
  },
];

export default function Work() {
  return (
    <section id="work" className="border-t border-ca-line py-[120px]">
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
