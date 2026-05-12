import Footer from "@/app/sections/footer/footer";
import Header from "@/app/sections/header/header";
import Hero from "@/app/sections/hero/hero";
import Marquee from "@/app/sections/marquee/marquee";
import Roster from "@/app/sections/roster/roster";
import Stats from "@/app/sections/stats/stats";
import Work from "@/app/sections/work/work";

export default function CelebrateAgencyPage() {
  return (
    <>
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
