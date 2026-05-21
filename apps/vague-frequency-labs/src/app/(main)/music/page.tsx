import type { ReactElement } from "react";
import { createMetadata } from "@/utils/index";
import MusicContent from "./MusicContent";

const title = "Music";
// 사용자 검토 필요 (영문 메타 카피 초안)
const description =
  "Explore the Vague Frequency Laboratory release catalog — experimental and innovative electronic music, tech house, and bass house from our roster of artists.";

export const metadata = createMetadata({
  title,
  description,
  keywords: ["Releases", "Discography", "Tech House", "Electronic Music", "Catalog"],
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
