import { Intro } from "@repo/ui/features/intro";
import { getAppUrls } from "@repo/utils/app-urls";

import { OG_IMAGE } from "@/consts/brand";
import { createMetadata } from "@/utils";

export const metadata = createMetadata({
  title: "Intro",
  description: "Enter Celebrate Agency — Talent · Production · Direction.",
  alternates: { canonical: "/intro" },
  openGraph: {
    images: [OG_IMAGE],
  },
  twitter: {
    images: [OG_IMAGE],
  },
});

export default function IntroPage() {
  return <Intro currentApp="celebrate-agency" appUrls={getAppUrls()} />;
}
