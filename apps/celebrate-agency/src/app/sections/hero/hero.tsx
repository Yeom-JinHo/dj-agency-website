import Image from "next/image";

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100dvh] flex-col pt-[100px] pb-16"
    >
      <h1 className="sr-only">
        Celebrate Agency — Talent · Production · Direction.
      </h1>
      <div className="flex flex-1 animate-hero-fade-in items-center justify-center px-6 lg:px-10">
        <Image
          src="/images/logo/hero.webp"
          alt="Celebrate Agency"
          width={400}
          height={300}
          priority
          sizes="(min-width: 1024px) 896px, 100vw"
          className="h-auto max-h-[calc(100dvh-320px)] w-full max-w-4xl"
        />
      </div>

      <div className="grid animate-hero-fade-in grid-cols-1 items-end gap-10 px-6 pt-8 [animation-delay:180ms] lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:px-10 lg:pt-12">
        <p className="max-w-[540px] text-lg leading-relaxed text-ca-fg lg:text-[22px]">
          Talent · Production · Direction.
          <br />
          Seoul, Korea.
        </p>
        <div className="flex items-center gap-3.5 lg:justify-end">
          <span className="inline-block h-2 w-2 animate-pulse-dot rounded-full bg-ca-red" />
          <nav
            aria-label="Section index"
            className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-ca-red lg:text-[13px]"
          >
            <span aria-hidden>↓</span>
            <a href="#roster" className="transition-colors hover:text-ca-fg">
              Roster
            </a>
            <span aria-hidden className="text-ca-muted">
              /
            </span>
            <a href="#work" className="transition-colors hover:text-ca-fg">
              Work
            </a>
            <span aria-hidden className="text-ca-muted">
              /
            </span>
            <a href="#contact" className="transition-colors hover:text-ca-fg">
              Contact
            </a>
          </nav>
        </div>
      </div>
    </section>
  );
}
