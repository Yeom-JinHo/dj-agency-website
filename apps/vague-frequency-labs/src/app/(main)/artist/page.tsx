import type { CollectionPage, WithContext } from "schema-dts";
import React, { ReactElement } from "react";
import Link from "next/link";
import { metadata as meta } from "@/app/config";
import { artistProfile } from "@/source";
import FancyLine from "@repo/ui/common/FancyLine";
import SectionHeading from "@/components/SectionHeading";
import { JsonLd } from "@repo/ui/common/JsonLd";
import { createMetadata } from "@/utils/index";

import ArtistSimpleCard from "../../sections/artistProfiles/ArtistSimpleCard";

const title = "Artists";
const description =
  "Meet the Vague Frequency Laboratory roster — tech house and bass house artists and DJs shaping experimental electronic music from Seoul.";

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
      <JsonLd items={jsonLd} />
      <section
        className="relative flex min-h-[50dvh] items-center justify-center"
        id="hero"
      >
        <div className="flex flex-col items-center md:max-w-7xl">
          <SectionHeading as="h1" variant="page">
            Artist
          </SectionHeading>

          <FancyLine className={"mt-16"} />
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
