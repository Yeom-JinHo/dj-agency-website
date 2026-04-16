import About from "../sections/about/about";
import ArtistProfiles from "../sections/artistProfiles/artistProfiles";
import MusicList from "../sections/musicList/MusicList";
import Hero from "../sections/hero/hero";

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
