import React from "react";
import { setRequestLocale } from "next-intl/server";
import FancyLine from "@repo/ui/common/FancyLine";
import SectionHeading from "@/components/SectionHeading";
import ParallaxGlobeLogo from "@/components/ParallaxGlobeLogo";
import { localizedMetadata } from "@/utils/index";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return localizedMetadata({
    locale,
    path: "/about",
    namespace: "about",
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
