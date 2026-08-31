import type { MusicGroup, WithContext } from "schema-dts";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { metadata as meta } from "@/app/config";
import { getArtistBySlug } from "@repo/content/queries";
import { toArtistProfile, VFL_SITE } from "@/utils/content-adapters";
import FancyLine from "@repo/ui/common/FancyLine";
import TextReveal from "@repo/ui/common/TextReveal";
import { Icon } from "@repo/ui/common/Icon";
import { JsonLd } from "@repo/ui/common/JsonLd";
import {
  createMetadata,
  localeAlternates,
  localeUrl,
  ogLocales,
} from "@/utils/index";
import { isProfileUrl } from "@/app/jsonLd";

import { cn } from "@repo/ui";
import { buttonVariants } from "@repo/ui/common/Button";
import ArtistImage from "@/app/sections/artistProfiles/ArtistImage";
import SectionHeading from "@/components/SectionHeading";

// 신규 slug 동적 라우트: generateStaticParams 제거 → 요청 시 dynamic 렌더 +
// getArtistBySlug의 unstable_cache 태그로 캐시(cms-plan §13). 아티스트 추가 시 빌드 불요.
export const dynamicParams = true;

export async function generateMetadata(props: {
  params: Promise<{ locale: string; artistName: string }>;
}) {
  const params = await props.params;
  const { locale, artistName } = params;
  const domainArtist = await getArtistBySlug(
    VFL_SITE,
    decodeURIComponent(artistName)
  );
  if (!domainArtist) notFound();
  const artist = toArtistProfile(domainArtist, locale);

  // 1200×630 고정 선언은 세로 원본과 안 맞는 거짓 치수였다(PR #244에서 제거).
  // CMS 전환 후 치수 메타데이터가 없으므로 선언 자체를 생략한다 — 거짓 치수보다
  // 무선언이 낫고, 스크레이퍼는 이미지를 fetch해 실치수를 얻는다.
  const cardImage = {
    alt: artist.name,
    url: artist.image,
    type: "image/webp",
  } as const;

  return createMetadata({
    title: artist.name,
    description: artist.shortDescription,
    openGraph: {
      type: "article",
      url: localeUrl(`/artist/${encodeURIComponent(artist.slug)}`, locale),
      images: [cardImage],
      authors: meta.author.name,
      ...ogLocales(locale),
    },
    twitter: {
      images: [cardImage],
    },
    alternates: localeAlternates(
      `/artist/${encodeURIComponent(artist.slug)}`,
      locale
    ),
  }) satisfies Metadata;
}

export default async function ProjectPage(props0: {
  params: Promise<{ locale: string; artistName: string }>;
}) {
  const params = await props0.params;
  const { locale, artistName } = params;
  setRequestLocale(locale);
  const domainArtist = await getArtistBySlug(
    VFL_SITE,
    decodeURIComponent(artistName)
  );
  if (!domainArtist) notFound();
  const artist = toArtistProfile(domainArtist, locale);
  const artistPath = `/artist/${encodeURIComponent(artist.slug)}`;
  const artistUrl = `${meta.site.url}${localeUrl(artistPath, locale)}`;
  // @id는 locale 불변(영어 canonical) — Organization/WebSite와 같은 원칙. en/ko가
  // 같은 아티스트를 서로 다른 엔티티로 선언하지 않게 한다. url만 locale별.
  const artistId = `${meta.site.url}${artistPath}#artist`;
  const sameAs = artist.socials?.map((s) => s.href).filter(isProfileUrl);

  // 루트 Organization(@id)에 memberOf로 연결. sameAs는 CMS socials 그대로 —
  // 스트리밍/소셜 프로필 URL이 엔티티 disambiguation의 핵심 신호.
  // 빈 값은 undefined로 두면 JSON.stringify가 키를 생략한다.
  const jsonLd: WithContext<MusicGroup> = {
    "@context": "https://schema.org",
    "@type": "MusicGroup",
    "@id": artistId,
    name: artist.name,
    alternateName:
      artist.nickname !== artist.name ? artist.nickname : undefined,
    description: artist.shortDescription || undefined,
    image: artist.image || undefined,
    url: artistUrl,
    genre: ["Tech House", "Bass House"],
    sameAs: sameAs?.length ? sameAs : undefined,
    memberOf: { "@id": `${meta.site.url}/#organization` },
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
