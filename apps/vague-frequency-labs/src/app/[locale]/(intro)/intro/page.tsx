import { Intro } from "@repo/ui/features/intro";
import { getAppUrls } from "@repo/utils/app-urls";
import { createMetadata } from "@/utils/index";

const title = "Intro";
const description =
  "Enter Vague Frequency Laboratory — an independent Seoul electronic music label and creative studio for experimental tech house and bass house.";

export const metadata = {
  ...createMetadata({
    title,
    description,
    keywords: ["Electronic Music", "Seoul", "Independent Label"],
    openGraph: {
      url: "/intro",
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
  }),
  // Gate/entry page — keep it out of the index; the home page carries SEO.
  robots: { index: false, follow: true },
};

export default function IntroPage() {
  return <Intro currentApp="vague-frequency-labs" appUrls={getAppUrls()} />;
}
