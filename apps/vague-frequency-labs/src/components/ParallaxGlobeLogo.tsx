"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import Globe from "./Globe";
import { COMPANY_SHORT_NAME } from "@/consts/company";

import TextReveal from "@repo/ui/common/TextReveal";

export default function ParallaxGlobeLogo(): ReactElement {
  return (
    <div className="relative w-full">
      <div className="flex flex-col items-center pt-4">
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
      </div>

      <div className="flex w-full items-center justify-center py-16">
        <Globe className="h-[260px] w-[260px] md:h-[360px] md:w-[360px] lg:h-[480px] lg:w-[480px] 2xl:h-[560px] 2xl:w-[560px]" />
      </div>
    </div>
  );
}
