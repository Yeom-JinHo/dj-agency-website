import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { metadata as meta } from "@/app/config";
import { artistProfile } from "@/source";
import TextReveal from "@repo/ui/common/TextReveal";
import { Icon } from "@repo/ui/common/Icon";
import { createMetadata } from "@/utils/index";

import { cn } from "@repo/ui";
import { buttonVariants } from "@repo/ui/common/Button";
import ArtistImage from "@/app/sections/artistProfiles/ArtistImage";

export function generateStaticParams() {
  return artistProfile.getPages().map((artist) => ({
    artistName: artist.name,
  }));
}

export async function generateMetadata(props: {
  params: Promise<{ artistName: string }>;
}) {
  const params = await props.params;
  const { artistName } = params;
  const artist = artistProfile.getPage(artistName);
  if (!artist) notFound();

  return createMetadata({
    title: artist.name,
    description: artist.shortDescription,
    openGraph: {
      type: "article",
      images: [
        {
          alt: "banner",
          width: 1200,
          height: 630,
          url: artist.image,
          type: "image/png",
        },
      ],
      authors: meta.author.name,
    },
  }) satisfies Metadata;
}

export default async function ProjectPage(props0: {
  params: Promise<{ artistName: string }>;
}) {
  const params = await props0.params;
  const { artistName } = params;
  const artist = artistProfile.getPage(artistName);
  if (!artist) notFound();

  return (
    <main className="my-16 flex-1">
      <div className="container mx-auto flex flex-col items-center justify-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
          {artistName}
        </h2>
        <div className="mt-12 h-96 w-72">
          <ArtistImage artist={artist} backgroundLogo={false} />
        </div>

        <div className="my-8 flex gap-1">
          {artist.socials?.map(({ iconName, href }, index) => {
            return (
              <Link
                target="_blank"
                rel="noopener noreferrer"
                href={href}
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "h-min w-min gap-1 p-0"
                )}
                key={`contact-social_${index}`}
              >
                {iconName && <Icon name={iconName} className="size-6" />}
              </Link>
            );
          })}
        </div>
      </div>
      <section className="container mb-12">
        <h2 className="mb-2 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
          About
        </h2>
        <p className="whitespace-pre-line text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
          {artist.fullDescription}
        </p>
      </section>
      <section className="container mb-12">
        <h2 className="mb-2 text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
          Photos
        </h2>
        <TextReveal
          as="p"
          className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
        >
          TBD
        </TextReveal>
      </section>
    </main>
  );
}
