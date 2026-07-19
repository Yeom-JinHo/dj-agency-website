import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { metadata as meta } from "@/app/config";
import { artistProfile } from "@/source";
import FancyLine from "@repo/ui/common/FancyLine";
import TextReveal from "@repo/ui/common/TextReveal";
import { Icon } from "@repo/ui/common/Icon";
import { createMetadata } from "@/utils/index";

import { cn } from "@repo/ui";
import { buttonVariants } from "@repo/ui/common/Button";
import ArtistImage from "@/app/sections/artistProfiles/ArtistImage";
import SectionHeading from "@/components/SectionHeading";

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
  const artist = artistProfile.getPage(decodeURIComponent(artistName));
  if (!artist) notFound();

  // 세로 원본을 그대로 1200×630으로 선언하던 것을 전용 OG 카드 라우트로 교체.
  // 파일 컨벤션 자동 태그는 팩토리 기본 og:image에 덮이므로 명시 지정한다 (PR #94 관례).
  const cardImage = {
    alt: artist.name,
    width: 1200,
    height: 630,
    url: `/artist/${encodeURIComponent(artist.name)}/og`,
    type: "image/png",
  } as const;

  return createMetadata({
    title: artist.name,
    description: artist.shortDescription,
    openGraph: {
      type: "article",
      images: [cardImage],
      authors: meta.author.name,
    },
    twitter: {
      images: [cardImage],
    },
    alternates: {
      canonical: `/artist/${encodeURIComponent(artist.name)}`,
    },
  }) satisfies Metadata;
}

export default async function ProjectPage(props0: {
  params: Promise<{ artistName: string }>;
}) {
  const params = await props0.params;
  const { artistName } = params;
  const artist = artistProfile.getPage(decodeURIComponent(artistName));
  if (!artist) notFound();

  return (
    <main className="my-16 flex-1">
      <section
        className="relative flex min-h-[calc(50dvh)] items-center justify-center"
        id="hero"
      >
        <div className="flex w-full flex-col items-center md:max-w-7xl">
          <SectionHeading as="h1" variant="page">
            {artist.name}
          </SectionHeading>
          <FancyLine className={"mt-16"} />
          <div className="mt-16 h-[280px] w-[210px] sm:h-[340px] sm:w-[255px] md:h-96 md:w-72">
            <ArtistImage
              artist={artist}
              backgroundLogo={false}
              priority
              sizes="(max-width: 768px) 210px, 288px"
            />
          </div>

          <div className="my-8 flex gap-2">
            {artist.socials?.map(({ iconName, href }, index) => {
              return (
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  href={href}
                  aria-label={`${artist.name}${iconName ? ` ${iconName}` : ""}`}
                  className={cn(
                    buttonVariants({ variant: "link" }),
                    // ≥44px touch target for the brand's one-handed-mobile frame.
                    "grid size-11 place-items-center p-0"
                  )}
                  key={`contact-social_${index}`}
                >
                  {iconName && <Icon name={iconName} className="size-6" />}
                </Link>
              );
            })}
          </div>
        </div>
      </section>
      <section className="mx-auto mb-12 w-full max-w-7xl px-8">
        <SectionHeading
          as="h2"
          className="mb-2 text-3xl sm:text-4xl lg:text-5xl"
        >
          About
        </SectionHeading>
        <p className="whitespace-pre-line text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
          {artist.fullDescription}
        </p>
      </section>
      <section className="mx-auto mb-12 w-full max-w-7xl px-8">
        <SectionHeading
          as="h2"
          className="mb-2 text-3xl sm:text-4xl lg:text-5xl"
        >
          Photos
        </SectionHeading>
        <TextReveal
          as="p"
          className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
        >
          TBD
        </TextReveal>
      </section>
    </main>
  );
}
