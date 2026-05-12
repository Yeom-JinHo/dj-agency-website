import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100dvh] flex-col pt-[100px] pb-16"
    >
      <div className="flex flex-1 items-center justify-center px-10">
        <Image
          src="/images/logo/hero.png"
          alt="Celebrate Agency"
          width={400}
          height={300}
          priority
          className="h-auto max-h-[calc(100dvh-320px)] w-full max-w-4xl"
        />
      </div>

      <div className="grid grid-cols-1 items-end gap-20 px-10 pt-12 lg:grid-cols-[1.1fr_1fr]">
        <p className="max-w-[540px] text-lg leading-relaxed text-ca-fg">
          Talent · Production · Direction.
          <br />
          Seoul, Korea.
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
