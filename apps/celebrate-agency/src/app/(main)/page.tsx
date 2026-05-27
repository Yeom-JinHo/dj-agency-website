import type { Metadata } from "next";

import { JsonLd } from "@repo/ui/common/JsonLd";

import Footer from "@/app/sections/footer/footer";
import Header from "@/app/sections/header/header";
import Hero from "@/app/sections/hero/hero";
import Marquee from "@/app/sections/marquee/marquee";
import Roster from "@/app/sections/roster/roster";
import Stats from "@/app/sections/stats/stats";
import Work from "@/app/sections/work/work";
import { organizationJsonLd } from "@/utils/jsonLd";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function CelebrateAgencyPage() {
  return (
    <>
      <JsonLd items={organizationJsonLd()} />
      <Header />
      <main className="flex-1">
        <Hero />
        <Marquee />
        <Roster />
        <Work />
        <Stats />
      </main>
      <Footer />
    </>
  );
}
