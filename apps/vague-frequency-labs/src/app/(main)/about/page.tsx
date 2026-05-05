import type { Organization, WithContext } from "schema-dts";
import React from "react";
import { metadata as meta } from "@/app/config";
import FancyLine from "@repo/ui/common/FancyLine";
import TextReveal from "@repo/ui/common/TextReveal";
import ParallaxGlobeLogo from "@/components/ParallaxGlobeLogo";
import { createMetadata } from "@/utils/index";

const title = "About";
const description = "Learn more about Vague Frequency Laboratory";

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
});

const jsonLd: WithContext<Organization> = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Vague Frequency Laboratory",
  description:
    "An independent music label focused on experimental and innovative electronic music",
  url: `${meta.site.url}/about`,
  sameAs: [meta.site.url],
  founder: {
    "@type": "Person",
    name: "Vague Frequency Laboratory Team",
  },
  foundingDate: "2024",
  knowsAbout: [
    "Electronic Music",
    "Experimental Music",
    "Music Production",
    "Sound Design",
    "Audio Engineering",
    "Ambient Music",
    "IDM",
  ],
};

export default function AboutPage() {
  return (
    <main className="my-14 flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
