import type { ReactElement } from "react";
import { createMetadata } from "@/utils/index";
import MusicContent from "./MusicContent";

const title = "Music & Releases";
const description =
  "Browse the Vague Frequency Laboratory discography — experimental tech house, bass house, and electronic music releases from our Seoul-based artists.";

export const metadata = createMetadata({
  title,
  description,
  keywords: ["Releases", "Discography", "Tech House", "Bass House", "Electronic Music"],
  openGraph: {
    url: "/music",
    title,
    description,
  },
  twitter: {
    title,
    description,
  },
  alternates: {
    canonical: "/music",
  },
});

export default function MusicPage(): ReactElement {
  return <MusicContent />;
}
