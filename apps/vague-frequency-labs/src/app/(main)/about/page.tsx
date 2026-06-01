import React from "react";
import FancyLine from "@repo/ui/common/FancyLine";
import SectionHeading from "@/components/SectionHeading";
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
        <div className="flex flex-col items-center md:max-w-7xl">
          <SectionHeading as="h1" variant="page">
            About
          </SectionHeading>
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
