import type { CollectionPage, WithContext } from "schema-dts";
import React from "react";
import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { metadata as meta } from "@/app/config";
import { artistProfile } from "@/source";
import { BlurFade } from "@repo/ui/common/BlurFade";
import FancyLine from "@repo/ui/common/FancyLine";
import SectionHeading from "@/components/SectionHeading";
import { JsonLd } from "@repo/ui/common/JsonLd";
import { createMetadata, localeAlternates, ogLocale } from "@/utils/index";

import ArtistSimpleCard from "@/app/sections/artistProfiles/ArtistSimpleCard";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.artist" });
  const title = t("title");
  const description = t("description");
  return createMetadata({
    title,
    description,
    openGraph: {
      url: "/artist",
      title,
      description,
      locale: ogLocale(locale),
    },
    twitter: {
      title,
      description,
    },
    alternates: localeAlternates("/artist", locale),
  });
}

export default async function ArtistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "Metadata.artist" });
  const jsonLd: WithContext<CollectionPage> = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: t("title"),
    description: t("description"),
    url: `${meta.site.url}/artist`,
    inLanguage: locale,
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
            {artistProfile.getPages().map((artist, index) => (
              <BlurFade key={index} inView duration={0.6}>
                <Link
                  href={`/artist/${artist.name}`}
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
