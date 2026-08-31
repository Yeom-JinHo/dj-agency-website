import type { CollectionPage, WithContext } from "schema-dts";
import React, { ReactElement } from "react";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { metadata as meta } from "@/app/config";
import { getArtists } from "@repo/content/queries";
import { toArtistProfile, VFL_SITE } from "@/utils/content-adapters";
import { BlurFade } from "@repo/ui/common/BlurFade";
import FancyLine from "@repo/ui/common/FancyLine";
import SectionHeading from "@/components/SectionHeading";
import { JsonLd } from "@repo/ui/common/JsonLd";
import { canonicalPath, localizedMetadata } from "@/utils/index";

import ArtistSimpleCard from "@/app/sections/artistProfiles/ArtistSimpleCard";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  return localizedMetadata({
    locale,
    path: "/artist",
    namespace: "artist",
  });
}

export default async function ArtistPage({
  params,
}: Props): Promise<ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Metadata.artist" });
  const artists = (await getArtists(VFL_SITE)).map(toArtistProfile);

  const jsonLd: WithContext<CollectionPage> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${meta.site.url}/artist#collection`,
    name: t("title"),
    description: t("description"),
    url: `${meta.site.url}${canonicalPath("/artist", locale)}`,
    inLanguage: locale,
    isPartOf: { "@id": `${meta.site.url}/#website` },
    // TODO:
    // hasPart: [...project.getPages()].map((project) => ({
    //   "@type": "SoftwareApplication",
    //   name: project.data.title,
    //   description: project.data.description,
    //   url: project.url,
    //   applicationCategory: "WebApplication",
    // })),
  };

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
              // 이미지 placeholder blur와 진입 blur가 겹치면 blur-up이 두 번
              // 일어나므로 진입은 fade/rise만 남긴다 (PR #228과 같은 원칙).
              // CMS 이미지도 imagePlaceholder(blurDataURL)를 가져 동일하게 적용.
              <BlurFade key={index} inView duration={0.6} blur="0px">
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
