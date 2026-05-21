import { createMetadata } from "@/utils/index";
import About from "../sections/about/about";
import ArtistProfiles from "../sections/artistProfiles/artistProfiles";
import MusicList from "../sections/musicList/MusicList";
import Hero from "../sections/hero/hero";

// 사용자 검토 필요 (영문 메타 카피 초안)
const description =
  "Vague Frequency Laboratory is an independent music label focused on experimental and innovative electronic music, representing a roster of tech house and bass house artists from Seoul.";

export const metadata = createMetadata({
  description,
  keywords: ["Tech House", "Bass House", "Electronic Music", "Music Label", "Seoul", "DJ"],
  openGraph: {
    url: "/",
    description,
  },
  twitter: {
    description,
  },
  alternates: {
    canonical: "/",
  },
});

export default function Home() {
  return (
    <main className="flex-1">
      <Hero />
      <About />
      <ArtistProfiles />
      <MusicList />
    </main>
  );
}
