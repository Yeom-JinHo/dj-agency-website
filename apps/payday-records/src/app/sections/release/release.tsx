import Image from "next/image";
import { IconArrowUpRight } from "@tabler/icons-react";
import MotionWrap from "@repo/ui/common/MotionWrap";
import TextReveal from "@repo/ui/common/TextReveal";
import { BlurFade } from "@repo/ui/common/BlurFade";

import { releases } from "./config";

function Release() {
  return (
    <MotionWrap
      className="w-full border-t border-black/5 py-24 lg:py-32 dark:border-white/10"
      id="release"
    >
      <div className="flex flex-col items-center justify-center px-4">
        <TextReveal
          as="h2"
          className="text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight"
        >
          Release
        </TextReveal>
        <TextReveal
          as="p"
          className="mt-4 max-w-[700px] text-center text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
        >
          From the catalog
        </TextReveal>

        <div className="mt-12 flex w-full max-w-[1200px] flex-wrap justify-center gap-8 md:gap-14">
          {releases.map((release, index) => (
            <BlurFade
              key={release.catalogNo ?? release.title}
              inView
              duration={0.6}
              delay={index * 0.08}
            >
              <a
                href={release.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block w-[160px] md:w-[340px]"
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                  {release.artwork ? (
                    <Image
                      src={release.artwork}
                      alt={release.title}
                      width={340}
                      height={340}
                      sizes="(max-width: 768px) 160px, 340px"
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="relative flex h-full w-full items-center justify-center bg-[#0f0f0f] p-4 text-center">
                      <span className="absolute top-0 left-0 h-full w-[3px] bg-orange-500" />
                      <span className="line-clamp-3 max-w-[85%] text-lg font-semibold tracking-tight text-white/85 md:text-xl">
                        {release.title}
                      </span>
                    </div>
                  )}
                  <div className="pointer-events-none absolute inset-0 flex items-end justify-end bg-black/0 p-3 opacity-0 transition-opacity duration-300 group-hover:bg-black/20 group-hover:opacity-100">
                    <IconArrowUpRight className="h-6 w-6 text-white" />
                  </div>
                </div>

                <div className="mt-3 text-left">
                  <h4 className="truncate text-sm font-semibold md:text-base">
                    {release.title}
                  </h4>
                  <p className="text-muted-foreground truncate text-xs md:text-sm">
                    {release.artist}
                  </p>
                  {(release.label || release.catalogNo) && (
                    <p className="text-muted-foreground/70 mt-1 truncate font-mono text-[10px] tracking-widest uppercase">
                      {[release.label, release.catalogNo]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  )}
                </div>
              </a>
            </BlurFade>
          ))}
        </div>
      </div>
    </MotionWrap>
  );
}

export default Release;
