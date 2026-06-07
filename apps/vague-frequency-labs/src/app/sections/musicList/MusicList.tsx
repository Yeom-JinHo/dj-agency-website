import Link from "next/link";
import { musicInfo } from "@/source";
import { BlurFade } from "@repo/ui/common/BlurFade";
import MusicInfoCard from "./MusicInfoCard";
import SectionHeading from "@/components/SectionHeading";

import { Button } from "@repo/ui/common/Button";
import { Icon } from "@repo/ui/common/Icon";

const baseMusicInfos = musicInfo.getInfos();
const musicInfos =
  baseMusicInfos.length === 0
    ? []
    : Array.from({ length: 9 }, (_, index) => {
        return baseMusicInfos[index % baseMusicInfos.length]!;
      });

function MusicList() {
  return (
    <section className="w-full py-24 lg:py-32" id="music-list">
      <div className="grid gap-10">
        <div className="flex w-full flex-col items-center justify-center px-4 text-center md:px-6 lg:flex-row lg:justify-between lg:text-left">
          <div className="flex flex-col items-center lg:items-start">
            <SectionHeading as="h2" className="flex flex-col -space-y-4">
              Music
            </SectionHeading>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center gap-4 overflow-hidden">
          <div className="flex flex-wrap justify-center gap-8 md:gap-12 xl:gap-16">
            {musicInfos.map((info, index) => (
              <BlurFade key={info.name + index} inView duration={0.6}>
                <MusicInfoCard musicInfo={info} />
              </BlurFade>
            ))}
          </div>
          <Link href="/music">
            <Button variant="outline" className="mt-12">
              <Icon name="LuPlus" className="mr-2 h-4 w-4" />
              More
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default MusicList;
