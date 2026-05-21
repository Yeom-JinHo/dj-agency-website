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
      <div className="flex flex-col items-center justify-center px-4 text-center">
        <TextReveal as="h2" className="section-heading">
          Shoutouts
        </TextReveal>
        <TextReveal
          as="p"
          className="mt-6 max-w-[640px] text-base/relaxed text-neutral-400 md:text-lg/relaxed"
        >
          Artists playing &amp; repping Payday Records
        </TextReveal>
        <ul className="mt-12 w-full max-w-[760px] divide-y divide-white/10 text-left">
          {credits.map((credit, index) => {
            const platform = platforms[credit.platform];

            return (
              <li key={`credit_${index}`}>
                <BlurFade inView delay={0.08 * index}>
                  <Link
                    href={credit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 py-5 transition-colors hover:bg-white/[0.03]"
                  >
                    <Icon
                      name={platform.iconName}
                      color={platform.brandColor}
                      className="h-5 w-5 shrink-0"
                    />
                    <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-0.5">
                      <span className="text-base font-medium md:text-lg">
                        {credit.artist}
                      </span>
                      {credit.note && (
                        <span className="text-sm text-neutral-400">
                          {credit.note}
                        </span>
                      )}
                      <span className="text-sm text-neutral-500">
                        · {credit.date}
                      </span>
                    </div>
                    <Icon
                      name="LuArrowUpRight"
                      className="h-4 w-4 shrink-0 text-neutral-500 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-neutral-300"
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
