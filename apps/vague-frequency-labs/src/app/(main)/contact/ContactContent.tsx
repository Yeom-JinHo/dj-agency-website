import type { ReactElement } from "react";
import React from "react";
import FancyLine from "@repo/ui/common/FancyLine";
import TextReveal from "@repo/ui/common/TextReveal";
import KoreaCinematic from "./KoreaCinematic";

export default function ContactContent(): ReactElement {
  return (
    <main className="my-16 flex-1">
      <section
        className="relative flex min-h-[calc(50dvh)] items-center justify-center"
        id="hero"
      >
        <div className="flex w-full flex-col items-center md:max-w-7xl">
          <TextReveal
            as="h1"
            className="leading-wide tracking-relaxed text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl"
          >
            Contact
          </TextReveal>

          <FancyLine className={"mt-16"} />
          <div className="relative flex h-full w-full flex-col items-center justify-center gap-4 overflow-hidden">
            <div className="flex w-full flex-col">
              <div className="space-y-4 p-8">
                <TextReveal
                  as="h2"
                  className="text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight"
                >
                  Email
                </TextReveal>
                <div className="space-y-4">
                  <TextReveal
                    as="p"
                    className="text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-300"
                  >
                    vaguefrequencylabs@gmail.com
                  </TextReveal>
                </div>
              </div>
              <div className="space-y-4 p-8">
                <TextReveal
                  as="h2"
                  className="text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight"
                >
                  Address
                </TextReveal>
                <div className="space-y-4">
                  <TextReveal
                    as="p"
                    className="text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-300"
                  >
                    서울특별시 중구 세종대로 110(수정)
                  </TextReveal>
                </div>
              </div>
            </div>

            <KoreaCinematic />
          </div>
        </div>
      </section>
    </main>
  );
}
