"use client";

import type { ReactElement } from "react";
import { useRef } from "react";
import Image from "next/image";
import Globe from "./Globe";
import { COMPANY_SHORT_NAME } from "@/consts/company";
import { useDebounce } from "@/hooks/useDebounce";
import { motion, useScroll, useTransform } from "motion/react";

import TextReveal from "@repo/ui/common/TextReveal";

export default function ParallaxGlobeLogo(): ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // 스크롤 이벤트를 16ms(60fps) 간격으로 디바운싱
  const debouncedScrollYProgress = useDebounce(scrollYProgress, 16);

  const globeScale = useTransform(
    debouncedScrollYProgress,
    [0, 0.5, 0.75],
    [1, 7, 10]
  );
  const globeOpacity = useTransform(
    debouncedScrollYProgress,
    [0, 0.5, 0.75],
    [1, 0, 0]
  );
  const globeTranslateY = useTransform(
    debouncedScrollYProgress,
    [0, 1],
    [0, 0]
  );

  const imageOpacity = useTransform(
    debouncedScrollYProgress,
    [0, 0.5, 0.75],
    [0, 0.3, 1]
  );
  const imageTranslateY = useTransform(
    debouncedScrollYProgress,
    [0, 0.5, 1],
    [20, 20, 0]
  );

  return (
    <div ref={containerRef} className="bg-red relative h-[400vh] w-full">
      <div
        className="sticky top-0 h-[100vh] overflow-hidden pt-64 md:h-[100vh] md:pt-20"
        // style={{ backgroundColor: "beige" }}
      >
        <motion.div
          className="absolute inset-0 z-0 flex flex-col items-center pt-4"
          style={{ opacity: imageOpacity, y: imageTranslateY }}
        >
          <Image
            src={`/images/logo/400_300/${COMPANY_SHORT_NAME.VAGUE_FREQUENCY_LABS}.png`}
            alt="Vague Frequency Laboratory"
            width={400}
            height={400}
            priority
          />
          <div className="space-y-4 p-8">
            <TextReveal
              as="h2"
              className="text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight"
            >
              About
            </TextReveal>
            <div className="space-y-4">
              <TextReveal
                as="p"
                className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
              >
                Vague Frequency Laboratory의 소개 Vague Frequency Laboratory
                Vague Frequency Laboratory Vague Frequency LaboratoryVague
                Frequency Laboratory Vague Frequency LaboratoryVague Frequency
                Laboratory
              </TextReveal>
            </div>
          </div>
          <div className="space-y-4 p-8">
            <TextReveal
              as="h2"
              className="text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight"
            >
              Partner
            </TextReveal>
            <div className="space-y-4">
              <TextReveal
                as="p"
                className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
              >
                Vague Frequency Laboratory의 소개 Vague Frequency Laboratory
                Vague Frequency Laboratory Vague Frequency LaboratoryVague
                Frequency Laboratory Vague Frequency LaboratoryVague Frequency
                Laboratory
              </TextReveal>
            </div>
          </div>
        </motion.div>

        {/* Foreground Globe pinned at top */}
        <motion.div
          className="relative z-10 flex h-full w-full items-start justify-center pt-4"
          style={{
            scale: globeScale,
            opacity: globeOpacity,
            y: globeTranslateY,
          }}
        >
          <Globe className="h-[260px] w-[260px] md:h-[360px] md:w-[360px] lg:h-[480px] lg:w-[480px] 2xl:h-[560px] 2xl:w-[560px]" />
        </motion.div>
      </div>
    </div>
  );
}
