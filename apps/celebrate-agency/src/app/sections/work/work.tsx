import { SectionHead } from "@/components/SectionHead";

import { workCases } from "./config";

export default function Work() {
  return (
    <section
      id="work"
      aria-labelledby="work-heading"
      className="border-t border-ca-line py-20 lg:py-[120px]"
    >
      <SectionHead
        num="02"
        numLabel="SELECTED WORK"
        title="Work"
        headingId="work-heading"
        aside={
          <>
            Last 12 months.
            <br />
            Archive on request.
          </>
        }
      />
      <div className="grid grid-cols-1 gap-6 px-6 lg:grid-cols-12 lg:px-10">
        {workCases.map((work) => (
          <a
            key={work.id}
            href="#"
            className={`relative cursor-pointer ${work.spanClassName}`}
          >
            <div
              className={`ca-stripe-ph-lg relative overflow-hidden border border-ca-line ${work.aspectClassName}`}
            >
              <span className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ca-muted lg:text-[11px]">
                {work.label}
              </span>
              <span className="absolute top-4 right-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ca-fg lg:text-[11px]">
                {work.tag}
              </span>
            </div>
            <div className="flex items-end justify-between pt-4">
              <h3 className="font-display text-3xl uppercase leading-none tracking-[0.01em]">
                {work.title}
              </h3>
              <div className="text-right font-mono text-[11px] uppercase tracking-[0.1em] text-ca-muted lg:text-[13px]">
                {work.credit}
                <br />
                {work.date}
              </div>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}
