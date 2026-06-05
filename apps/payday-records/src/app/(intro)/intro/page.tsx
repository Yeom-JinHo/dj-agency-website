import { Intro } from "@repo/ui/features/intro";
import { getAppUrls } from "@repo/utils/app-urls";

import { createMetadata } from "@/utils";

const title = "Intro";
const description = "Enter Payday Records — an independent music label.";

// Plain string title -> root layout template renders "Intro | Payday Records",
// distinct from the home page title (per-page metadata requirement).
export const metadata = {
  ...createMetadata({
    title,
    description,
    openGraph: {
      url: "/intro",
      title,
      description,
    },
    twitter: { title, description },
  }),
  // Gate/entry page — keep it out of the index; the home page carries SEO.
  robots: { index: false, follow: true },
};

export default function IntroPage() {
  return <Intro currentApp="payday-records" appUrls={getAppUrls()} />;
}
