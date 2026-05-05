import type { ReactElement } from "react";

import About from "../sections/about/about";
import Contact from "../sections/contact/contact";
import Hero from "../sections/hero/hero";
import Playlist from "../sections/playlist/playlist";

export default function Home(): ReactElement {
  return (
    <main className="flex-1">
      <Hero />
      <About />
      <Playlist />
      <Contact />
    </main>
  );
}
