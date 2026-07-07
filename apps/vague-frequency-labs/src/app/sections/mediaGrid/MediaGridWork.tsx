import SectionHeading from "@/components/SectionHeading";
import { mediaTiles } from "./config";

/**
 * celebrate Work 섹션의 12-col 혼합 그리드 문법을 VFL 다크 팔레트로 이식.
 * 타일은 전부 placeholder(대각 스트라이프), 콘텐츠 유형은 타일 제목이 말해준다.
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
              />
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
