import type { MusicInfo } from "@/types/music";
import { Link } from "@/i18n/navigation";
import { musicInfo } from "@/source";
import { BlurFade } from "@repo/ui/common/BlurFade";
import MusicInfoCard from "./MusicInfoCard";
import SectionHeading from "@/components/SectionHeading";

import { Icon } from "@repo/ui/common/Icon";

const baseMusicInfos = musicInfo.getInfos();

// 카드별 리듬 값 (인덱스 기반, deterministic)
const ROTS = [-3, 2.5, -2, 3, -2.5, 2, -3.5, 2, -2, 3];
const DYS = [0, 40, 14, 46, 24, -6, 36, 12, 44, 18, -4, 30, 8, 50, 20];

interface CollageCard {
  info: MusicInfo;
  rot: number;
  dy: number;
  z: number;
}

// cols×rows 콜라주 카드 생성.
// 곡은 (열 + 행×2) 로 배치해 같은 곡이 가로·세로로 인접하지 않게 분산.
function buildCards(cols: number, rows: number): CollageCard[] {
  if (baseMusicInfos.length === 0) return [];
  const count = cols * rows;
  return Array.from({ length: count }, (_, i) => ({
    info: baseMusicInfos[
      ((i % cols) + Math.floor(i / cols) * 2) % baseMusicInfos.length
    ]!,
    rot: ROTS[i % ROTS.length]!,
    dy: DYS[i % DYS.length]!,
    z: 2 + ((i * 5) % 6),
  }));
}

const desktopCards = buildCards(5, 3); // 15
const mobileCards = buildCards(2, 4); // 8

function MusicList() {
  return (
    <section className="w-full py-24 lg:py-32" id="music-list">
      <div className="grid gap-10">
        <div className="flex w-full flex-col items-center justify-center px-6 text-center md:px-10 lg:flex-row lg:justify-between lg:px-16 lg:text-left">
          <div className="flex flex-col items-center lg:items-start">
            <SectionHeading as="h2" className="flex flex-col -space-y-4">
              Music
            </SectionHeading>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center gap-4">
          {/* 데스크톱: 5열 overlapping collage */}
          <div className="hidden w-full justify-center lg:flex">
            <div className="flex max-w-[940px] flex-wrap items-start justify-center xl:max-w-[1140px]">
              {desktopCards.map((c, i) => (
                <div
                  key={c.info.name + i}
                  className="relative transition-transform duration-300 ease-out hover:!z-[60] hover:!rotate-0 hover:scale-[1.05] motion-reduce:transition-none"
                  style={{
                    margin: "0 -28px -26px",
                    marginTop: c.dy,
                    zIndex: c.z,
                    transform: `rotate(${c.rot}deg)`,
                  }}
                >
                  <BlurFade inView duration={0.6}>
                    <MusicInfoCard
                      musicInfo={c.info}
                      variant="collage"
                      cardClassName="h-[228px] w-[228px] shadow-[0_24px_60px_rgba(0,0,0,0.55)] outline outline-1 outline-white/[0.06] xl:h-[272px] xl:w-[272px]"
                    />
                  </BlurFade>
                </div>
              ))}
            </div>
          </div>

          {/* 모바일: 2열 미니 collage */}
          <div className="flex w-full justify-center lg:hidden">
            <div className="flex max-w-[380px] flex-wrap items-start justify-center sm:max-w-[440px]">
              {mobileCards.map((c, i) => (
                <div
                  key={c.info.name + i}
                  className="relative transition-transform duration-300 ease-out active:!z-[60] active:!rotate-0 active:scale-[1.05] motion-reduce:transition-none"
                  style={{
                    margin: "0 -12px -14px",
                    marginTop: Math.round(c.dy * 0.5),
                    zIndex: c.z,
                    transform: `rotate(${c.rot}deg)`,
                  }}
                >
                  <BlurFade inView duration={0.6}>
                    <MusicInfoCard
                      musicInfo={c.info}
                      variant="collage"
                      cardClassName="h-[172px] w-[172px] shadow-[0_18px_40px_rgba(0,0,0,0.55)] outline outline-1 outline-white/[0.06] sm:h-[196px] sm:w-[196px]"
                    />
                  </BlurFade>
                </div>
              ))}
            </div>
          </div>

          <Link
            href="/music"
            className="group mt-14 inline-flex items-center gap-3 border border-white/40 px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-black md:px-8 md:py-3.5 md:text-sm"
          >
            More
            <Icon
              name="LuArrowRight"
              className="size-4 transition-transform duration-300 ease-out group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default MusicList;
