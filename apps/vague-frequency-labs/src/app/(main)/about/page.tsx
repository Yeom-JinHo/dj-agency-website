import React from "react";
import FancyLine from "@repo/ui/common/FancyLine";
import TextReveal from "@repo/ui/common/TextReveal";
import ParallaxGlobeLogo from "@/components/ParallaxGlobeLogo";
import { createMetadata } from "@/utils/index";

const title = "About";
const description =
  "About Vague Frequency Laboratory — an independent Seoul electronic music label and creative studio built around experimental tech house and bass house.";

export const metadata = createMetadata({
  title,
  description,
  openGraph: {
    url: "/about",
    title,
    description,
  },
  twitter: {
    title,
    description,
  },
  alternates: {
    canonical: "/about",
  },
});

export default function AboutPage() {
  return (
    <main className="my-14 flex-1">
      <section
        className="relative flex min-h-[calc(50dvh)] items-center justify-center"
        id="about"
      >
        <div className="flex w-screen flex-col items-center">
          {/* todo: re-add delay of 0.2seconds */}
          <TextReveal
            as="h1"
            className="leading-wide tracking-relaxed text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl"
          >
            About
          </TextReveal>
          <FancyLine className={"mt-16"} />
          {/* Parallax Globe + Logo */}
          <div className="w-full">
            <ParallaxGlobeLogo />
          </div>
        </div>
      </section>
    </main>
  );
}
