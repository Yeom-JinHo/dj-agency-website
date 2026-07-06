import { createMetadata } from "@/utils/index";
import About from "../sections/about/about";
import MediaGridWork from "../sections/mediaGrid/MediaGridWork";
import MusicList from "../sections/musicList/MusicList";
import Hero from "../sections/hero/hero";

const description =
  "Vague Frequency Laboratory is an independent Seoul electronic music label spotlighting experimental tech house and bass house artists, releases, and live sets.";

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
      <MediaGridWork />
      <MusicList />
    </main>
  );
}
