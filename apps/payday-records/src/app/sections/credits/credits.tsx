import React from "react";
import Link from "next/link";
import MotionWrap from "@repo/ui/common/MotionWrap";
import TextReveal from "@repo/ui/common/TextReveal";
import { BlurFade } from "@repo/ui/common/BlurFade";
import { Icon } from "@repo/ui/common/Icon";

import { credits, platforms } from "./config";

function Credits() {
  // 항목이 없으면 섹션 자체를 렌더링하지 않는다.
  if (credits.length === 0) {
    return null;
  }

  return (
    <MotionWrap className="w-full py-24 lg:py-32" id="credits">
      <div className="flex flex-col items-center justify-center px-4">
        <TextReveal
          as="h2"
          className="text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight"
        >
          Shoutouts
        </TextReveal>
        <TextReveal
          as="p"
          className="mt-4 max-w-[700px] text-center text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
        >
          Artists playing & repping Payday Records
        </TextReveal>
        <ul className="mt-12 w-full max-w-[760px] divide-y divide-white/10">
          {credits.map((credit, index) => {
            const platform = platforms[credit.platform];

            return (
              <li key={`credit_${index}`}>
                <BlurFade inView delay={0.08 * index}>
                  <Link
                    href={credit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-3 py-4 transition-colors hover:bg-white/[0.03]"
                  >
                    <Icon
                      name={platform.iconName}
                      color={platform.brandColor}
                      className="h-5 w-5 shrink-0"
                    />
                    <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="font-medium">{credit.artist}</span>
                      {credit.note && (
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {credit.note}
                        </span>
                      )}
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        · {credit.date}
                      </span>
                    </div>
                    <Icon
                      name="LuArrowUpRight"
                      className="h-4 w-4 shrink-0 text-gray-500 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 dark:text-gray-400"
                    />
                  </Link>
                </BlurFade>
              </li>
            );
          })}
        </ul>
      </div>
    </MotionWrap>
  );
}

export default Credits;
