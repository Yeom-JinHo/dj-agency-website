import { Intro } from "@repo/ui/features/intro";
import { getAppUrls } from "@repo/utils/app-urls";
import { createMetadata } from "@/utils/index";

const title = "Intro";
// 사용자 검토 필요 (영문 메타 카피 초안)
const description =
  "Enter Vague Frequency Laboratory — an independent electronic music label and creative studio based in Seoul.";

export const metadata = createMetadata({
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
  alternates: {
    canonical: "/intro",
  },
});

export default function IntroPage() {
  return <Intro currentApp="vague-frequency-labs" appUrls={getAppUrls()} />;
}
