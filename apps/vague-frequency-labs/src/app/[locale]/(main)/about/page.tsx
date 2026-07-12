import React from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import FancyLine from "@repo/ui/common/FancyLine";
import SectionHeading from "@/components/SectionHeading";
import ParallaxGlobeLogo from "@/components/ParallaxGlobeLogo";
import { createMetadata, localeAlternates, ogLocale } from "@/utils/index";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.about" });
  const title = t("title");
  const description = t("description");
  return createMetadata({
    title,
    description,
    openGraph: {
      url: "/about",
      title,
      description,
      locale: ogLocale(locale),
    },
    twitter: {
      title,
      description,
    },
    alternates: localeAlternates("/about", locale),
  });
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className="my-16 flex-1">
      <section
        className="relative flex min-h-[calc(50dvh)] items-center justify-center"
        id="about"
      >
        <div className="flex w-full flex-col items-center md:max-w-7xl">
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
