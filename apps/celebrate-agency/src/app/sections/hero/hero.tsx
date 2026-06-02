import type { CSSProperties } from "react";

import { AGENCY_PATH, CELEBRATE_PATH } from "./logo-paths";

// 스티치 진입: 각자 자기 각도 바깥(코너 방향)에서 밀려 들어와 탕! 박힘.
// 글자 fade(0~520ms)가 안착한 뒤 한 박자 띄워(560ms~) 단독 비트로 stab —
// 빈 로고 위에 빨강이 꽂히는 게 또렷이 읽히도록 분리. delay 12ms 간격.
type StitchStyle = CSSProperties & { "--sx": string; "--sy": string };
const STITCH_INTRO: StitchStyle[] = [
  { "--sx": "-13px", "--sy": "-16px", animationDelay: "560ms" }, // 좌상
  { "--sx": "13px", "--sy": "-16px", animationDelay: "572ms" }, // 우상
  { "--sx": "-13px", "--sy": "16px", animationDelay: "584ms" }, // 좌하
  { "--sx": "13px", "--sy": "16px", animationDelay: "596ms" }, // 우하
];

export default function Hero() {
  return (
    <section
      id="top"
      className="relative flex min-h-[100dvh] flex-col pt-[100px] pb-16"
    >
      <h1 className="sr-only">
        Celebrate Agency — Talent · Production · Direction.
      </h1>
      <div className="flex flex-1 items-center justify-center px-6 lg:px-10">
        <svg
          viewBox="0 0 400 300"
          aria-hidden
          className="h-auto max-h-[calc(100dvh-320px)] w-full max-w-4xl"
        >
          {/* hover 트리거를 워드마크 범위로 한정하는 투명 hit-rect(콘텐츠 밴드만 덮음).
              SVG 박스 전체(여백 포함)가 아니라 이 영역에 마우스가 올 때만 반응. */}
          <g className="ca-logo">
            <rect x="4" y="96" width="392" height="130" fill="transparent" />
            {/* 글자는 Bebas Neue 아웃라인을 path로 굳혀, 표시 크기와 무관하게 굵기 고정 */}
            <g className="animate-ca-type-in">
              <path d={CELEBRATE_PATH} fill="var(--color-ca-fg)" />
              <path d={AGENCY_PATH} fill="var(--color-ca-fg)" />
            </g>
            {/* 스티치 4개는 원본의 손그림 비대칭(길이·각도 제각각)을 그대로 복제.
              entrance transform은 .ca-stitch <g>에, rotate는 안쪽 rect에 분리. */}
            <g fill="var(--color-ca-red)">
              {/* 좌상: 가장 길고 곧추섬(-47°), 끝이 C 정점에 닿을 만큼만 겹침 */}
              <g
                className="ca-stitch animate-ca-stitch-stab"
                style={STITCH_INTRO[0]}
              >
                <g className="ca-stitch-react">
                  <rect
                    x="11"
                    y="105"
                    width="47"
                    height="10"
                    rx="2"
                    transform="rotate(-47 34.5 110)"
                  />
                </g>
              </g>
              {/* 우상: E 우상 모서리를 덮도록 좌하로 이동 */}
              <g
                className="ca-stitch animate-ca-stitch-stab"
                style={STITCH_INTRO[1]}
              >
                <g className="ca-stitch-react">
                  <rect
                    x="342.4"
                    y="102.5"
                    width="43"
                    height="10"
                    rx="2"
                    transform="rotate(46 364 107.5)"
                  />
                </g>
              </g>
              {/* 좌하: 가장 짧음, 원본 빨강 위치 그대로(C 좌하를 가로질러 가림) */}
              <g
                className="ca-stitch animate-ca-stitch-stab"
                style={STITCH_INTRO[2]}
              >
                <g className="ca-stitch-react">
                  <rect
                    x="23.5"
                    y="166"
                    width="31"
                    height="10"
                    rx="2"
                    transform="rotate(45 39 171)"
                  />
                </g>
              </g>
              {/* 우하: 원본 빨강 위치 그대로(E 우하 모서리를 가림) */}
              <g
                className="ca-stitch animate-ca-stitch-stab"
                style={STITCH_INTRO[3]}
              >
                <g className="ca-stitch-react">
                  <rect
                    x="345"
                    y="165.5"
                    width="37"
                    height="10"
                    rx="2"
                    transform="rotate(-45 363.5 170.5)"
                  />
                </g>
              </g>
            </g>
          </g>
        </svg>
      </div>

      <div className="grid animate-hero-fade-in grid-cols-1 items-end gap-10 px-6 pt-8 [animation-delay:1040ms] lg:grid-cols-[1.1fr_1fr] lg:gap-20 lg:px-10 lg:pt-12">
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
