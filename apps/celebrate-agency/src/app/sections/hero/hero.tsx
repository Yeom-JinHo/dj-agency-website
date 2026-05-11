import { Bracket } from "@/components/Bracket";

export default function Hero() {
  return (
    <section id="top" className="relative pt-[140px] pb-[100px]">
      <div className="mb-12 grid grid-cols-1 items-start gap-10 px-10 lg:grid-cols-2">
        <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ca-muted">
          <span className="inline-block h-2 w-2 bg-ca-red" />
          CELEBRATE / AGENCY · EST. 2019 · SEOUL — LA
        </span>
        <div className="flex flex-wrap gap-8 lg:justify-end">
          <div className="min-w-[140px] text-right">
            <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-[0.08em] text-ca-muted">
              Index
            </span>
            <span className="font-mono text-sm text-ca-fg">01 / 04</span>
          </div>
        </div>
      </div>

      <h1 className="px-10 font-display text-[clamp(72px,15vw,224px)] uppercase leading-[0.86] tracking-[-0.005em]">
        <span className="block">
          <Bracket>Celebrate</Bracket>
        </span>
        <span className="block">
          Agency<span className="italic text-ca-red">.</span>
        </span>
      </h1>

      <div className="grid grid-cols-1 items-end gap-20 px-10 pt-12 lg:grid-cols-[1.1fr_1fr]">
        <p className="max-w-[540px] text-lg leading-relaxed text-ca-fg">
          Talent · Production · Direction.
          <br />
          Seoul — Los Angeles.
        </p>
        <div className="flex items-center gap-3.5 lg:justify-end">
          <span className="inline-block h-2 w-2 animate-pulse-dot rounded-full bg-ca-red" />
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-ca-red">
            ↓ 01 / 04
          </span>
        </div>
      </div>
    </section>
  );
}
