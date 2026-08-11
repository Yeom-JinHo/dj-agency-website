"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "motion/react";
import MotionWrap from "@repo/ui/common/MotionWrap";
import TextReveal from "@repo/ui/common/TextReveal";
import { BlurFade } from "@repo/ui/common/BlurFade";

import type { Release as ReleaseItem } from "@/types/release";
import ReleaseCard from "./release-card";

const PlatformModal = dynamic(() => import("./platform-modal"), { ssr: false });

// releases는 서버 컴포넌트(page.tsx)에서 @repo/content로 조회해 주입한다.
function Release({ releases }: { releases: ReleaseItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const close = useCallback(() => setOpenIndex(null), []);

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [openIndex, close]);

  const activeRelease = openIndex !== null ? releases[openIndex] : null;

  return (
    <MotionWrap className="section-gap w-full" id="release">
      <div className="flex flex-col items-center justify-center px-4 text-center">
        <TextReveal as="h2" className="section-heading">
          Release
        </TextReveal>
        <TextReveal
          as="p"
          className="mt-6 max-w-[640px] text-base/relaxed text-neutral-400 md:text-lg/relaxed"
        >
          From the catalog
        </TextReveal>

        <div className="mt-12 flex w-full max-w-[1200px] flex-wrap justify-center gap-8 md:gap-14">
          {releases.map((release, index) => (
            <BlurFade
              key={release.slug}
              inView
              duration={0.6}
              delay={index * 0.08}
            >
              <ReleaseCard
                release={release}
                onOpen={() => setOpenIndex(index)}
              />
            </BlurFade>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {activeRelease && (
          <PlatformModal release={activeRelease} onClose={close} />
        )}
      </AnimatePresence>
    </MotionWrap>
  );
}

export default Release;
