const STATS: { v: string; sup: string | null; k: string }[] = [
  { v: "6", sup: "★", k: "Signed artists" },
  { v: "112", sup: null, k: "Projects shipped" },
  { v: "6", sup: null, k: "Years on the wall" },
  { v: "1", sup: null, k: "City · Seoul" },
];

export default function Stats() {
  return (
    <section className="grid grid-cols-2 gap-px border-y border-ca-line bg-ca-line lg:grid-cols-4">
      {STATS.map((s) => (
        <div key={s.k} className="bg-ca-bg px-6 py-10 lg:px-8 lg:py-12">
          <div className="font-display text-[64px] leading-none tracking-[-0.01em] lg:text-[88px]">
            {s.v}
            {s.sup ? (
              <sup className="ml-1 align-top text-[24px] text-ca-red lg:text-[32px]">
                {s.sup}
              </sup>
            ) : null}
          </div>
          <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.14em] text-ca-muted">
            {s.k}
          </div>
        </div>
      ))}
    </section>
  );
}
