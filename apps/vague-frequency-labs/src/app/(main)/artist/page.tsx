import type { CollectionPage, WithContext } from "schema-dts";
import React, { ReactElement } from "react";
import Link from "next/link";
import { metadata as meta } from "@/app/config";
import { getArtists } from "@repo/content/queries";
import { toArtistProfile, VFL_SITE } from "@/utils/content-adapters";
import { BlurFade } from "@repo/ui/common/BlurFade";
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

export default async function ArtistPage(): Promise<ReactElement> {
  const artists = (await getArtists(VFL_SITE)).map(toArtistProfile);

  return (
    <main className="my-16 flex-1">
      <JsonLd items={jsonLd} />
      <section
        className="relative flex min-h-[calc(50dvh)] items-center justify-center"
        id="hero"
      >
        <div className="flex w-full flex-col items-center md:max-w-7xl">
          <SectionHeading as="h1" variant="page">
            Artist
          </SectionHeading>

          <FancyLine className={"mt-16"} />
          <div className="mt-16 flex flex-wrap justify-center gap-16">
            {artists.map((artist, index) => (
              <BlurFade key={index} inView duration={0.6}>
                <Link
                  href={`/artist/${encodeURIComponent(artist.slug)}`}
                  className="cursor-pointer"
                >
                  <ArtistSimpleCard artist={artist} />
                </Link>
              </BlurFade>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
