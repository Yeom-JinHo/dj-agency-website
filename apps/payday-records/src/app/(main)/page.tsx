import type { ReactElement } from "react";

import { createMetadata } from "@/utils";
import About from "../sections/about/about";
import Contact from "../sections/contact/contact";
import Hero from "../sections/hero/hero";
import Playlist from "../sections/playlist/playlist";
import Release from "../sections/release/release";

const title = "Payday Records — Independent Music Label";
const description =
  "Payday Records is an independent music label. Explore our releases, playlists, and artists.";

// `title.absolute` bypasses the root layout's "%s | Payday Records" template
// so the home page title is not suffixed with the brand name twice.
export const metadata = createMetadata({
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: {
    url: "/",
    // `absolute` so the root layout's "%s | Payday Records" template is not
    // applied to the share-card title (which would duplicate the brand name).
    title: { absolute: title },
    description,
  },
  twitter: { title: { absolute: title }, description },
});

export default function Home(): ReactElement {
  return (
    <main className="flex-1">
      <Hero />
      <About />
      <Release />
      <Playlist />
      <Contact />
    </main>
  );
}
