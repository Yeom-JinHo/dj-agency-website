import { AGENCY_PATH, CELEBRATE_PATH } from "./logo-paths";

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
        <svg
          viewBox="0 0 400 300"
          aria-hidden
          className="h-auto max-h-[calc(100dvh-320px)] w-full max-w-4xl"
        >
          {/* 글자는 Bebas Neue 아웃라인을 path로 굳혀, 표시 크기와 무관하게 굵기 고정 */}
          <path d={CELEBRATE_PATH} fill="var(--color-ca-fg)" />
          <path d={AGENCY_PATH} fill="var(--color-ca-fg)" />
          {/* 스티치 4개는 원본의 손그림 비대칭(길이·각도 제각각)을 그대로 복제 */}
          <g fill="var(--color-ca-red)">
            {/* 좌상: 가장 길고 곧추섬(-47°), C 어깨를 살짝 덮음 */}
            <rect
              x="11.5"
              y="106"
              width="47"
              height="10"
              rx="2"
              transform="rotate(-47 35 111)"
            />
            {/* 우상 */}
            <rect
              x="344.4"
              y="98.5"
              width="43"
              height="10"
              rx="2"
              transform="rotate(46 366 103.5)"
            />
            {/* 좌하: 가장 짧음 */}
            <rect
              x="26.4"
              y="163"
              width="31"
              height="10"
              rx="2"
              transform="rotate(45 42 168)"
            />
            {/* 우하 */}
            <rect
              x="343.6"
              y="163"
              width="37"
              height="10"
              rx="2"
              transform="rotate(-45 362 168)"
            />
          </g>
        </svg>
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
