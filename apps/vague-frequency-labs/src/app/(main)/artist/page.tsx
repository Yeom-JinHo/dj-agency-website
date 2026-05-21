import type { CollectionPage, WithContext } from "schema-dts";
import React, { ReactElement } from "react";
import Link from "next/link";
import { metadata as meta } from "@/app/config";
import { artistProfile } from "@/source";
import FancyLine from "@repo/ui/common/FancyLine";
import TextReveal from "@repo/ui/common/TextReveal";
import { createMetadata } from "@/utils/index";

import ArtistSimpleCard from "../../sections/artistProfiles/ArtistSimpleCard";

const title = "Artist";
const description = "Here are some artist I have worked on.";

export const metadata = createMetadata({
  title,
  description,
  openGraph: {
    url: "/artist",
    title,
    description,
  },
  twitter: {
    title,
    description,
  },
  alternates: {
    canonical: "/artist",
  },
});

const jsonLd: WithContext<CollectionPage> = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: title,
  description,
  url: `${meta.site.url}/artist`,
  isPartOf: {
    "@type": "WebSite",
    name: meta.site.title,
    url: meta.site.url,
  },
  // TODO:
  // hasPart: [...project.getPages()].map((project) => ({
  //   "@type": "SoftwareApplication",
  //   name: project.data.title,
  //   description: project.data.description,
  //   url: project.url,
  //   applicationCategory: "WebApplication",
  // })),
};

export default function ArtistPage(): ReactElement {
  return (
    <main className="my-16 flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section
        className="relative flex min-h-[calc(50dvh)] items-center justify-center"
        id="hero"
      >
        <div className="flex flex-col items-center md:max-w-7xl">
          {/* todo: re-add delay of 0.2seconds */}
          <TextReveal
            as="h1"
            className="leading-wide tracking-relaxed text-5xl sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl"
          >
            Artist
          </TextReveal>

          <FancyLine className={"m-16"} />
          <div className="flex flex-wrap justify-center gap-16">
            {artistProfile.getPages().map((artist, index) => (
              <Link
                key={index}
                href={`/artist/${artist.name}`}
                className="cursor-pointer"
              >
                <ArtistSimpleCard artist={artist} />
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
