import SectionHeading from "@/components/SectionHeading";
import { mediaTiles } from "./config";

/** ▶ 글리프 — 아이콘 의존성 없이 인라인 SVG */
function PlayMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <path d="M8 5v14l11-7z" fill="currentColor" />
    </svg>
  );
}

/**
 * Option 1 — Work Grammar
 * celebrate Work 섹션의 12-col 혼합 그리드 문법을 VFL 다크 팔레트로 이식.
 * 타일은 전부 placeholder(대각 스트라이프), 영상 타일만 ▶ 마크로 구분.
 */
function MediaGridWork() {
  return (
    <section className="w-full py-24 lg:py-32" id="media">
      <div className="grid gap-10">
        <div className="flex w-full flex-col items-center justify-center px-6 text-center md:px-10 lg:flex-row lg:items-end lg:justify-between lg:px-16 lg:text-left">
          <SectionHeading as="h2" className="flex flex-col -space-y-4">
            Media
          </SectionHeading>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em] text-white/40 lg:mt-0 lg:text-right lg:text-xs">
            Footage in preparation.
            <br className="hidden lg:block" /> Archive opens 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 px-6 md:px-10 lg:grid-cols-12 lg:px-16">
          {mediaTiles.map((tile) => (
            <div key={tile.id} className={`relative ${tile.spanClassName}`}>
              <div
                className={`vfl-media-ph-stripe relative overflow-hidden border border-white/10 ${tile.aspectClassName}`}
              >
                <span className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-[0.14em] text-white/45 lg:text-[11px]">
                  [ {tile.meta} ]
                </span>
                {tile.kind === "video" && (
                  <span className="absolute inset-0 m-auto flex size-11 items-center justify-center rounded-full border border-white/25 text-white/55 lg:size-12">
                    <PlayMark className="size-4 translate-x-[1px]" />
                  </span>
                )}
              </div>
              <div className="flex items-end justify-between gap-4 pt-4">
                <h3 className="font-display text-2xl uppercase leading-none tracking-tight lg:text-3xl">
                  {tile.title}
                </h3>
                <span className="text-right font-mono text-[10px] uppercase tracking-[0.1em] text-white/40 lg:text-[11px]">
                  {tile.credit}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default MediaGridWork;
