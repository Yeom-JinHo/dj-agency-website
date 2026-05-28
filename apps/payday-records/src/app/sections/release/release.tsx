"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "motion/react";
import MotionWrap from "@repo/ui/common/MotionWrap";
import TextReveal from "@repo/ui/common/TextReveal";
import { BlurFade } from "@repo/ui/common/BlurFade";

import { releases } from "./config";
import ReleaseCard from "./release-card";

const PlatformModal = dynamic(() => import("./platform-modal"), { ssr: false });

function Release() {
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
    <MotionWrap className="w-full py-28 lg:py-40" id="release">
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
              key={release.catalogNo ?? release.title}
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
