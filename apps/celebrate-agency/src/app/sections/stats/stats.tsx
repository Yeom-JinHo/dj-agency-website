import { stats } from "./config";

export default function Stats() {
  return (
    <section className="grid grid-cols-2 gap-px border-y border-ca-line bg-ca-line lg:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-ca-bg px-6 py-10 lg:px-8 lg:py-12">
          <div className="font-display text-[64px] leading-none tracking-[-0.01em] lg:text-[88px]">
            {stat.value}
            {stat.superscript ? (
              <sup className="ml-1 align-top text-[24px] text-ca-red lg:text-[32px]">
                {stat.superscript}
              </sup>
            ) : null}
          </div>
          <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ca-muted">
            {stat.label}
          </div>
        </div>
      ))}
    </section>
  );
}
