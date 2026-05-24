import { Intro } from "@repo/ui/features/intro";
import { getAppUrls } from "@repo/utils/app-urls";

import { createMetadata } from "@/utils";

export const metadata = createMetadata({
  title: "Intro",
  description: "Enter Celebrate Agency — Talent · Production · Direction.",
  alternates: { canonical: "/intro" },
});

export default function IntroPage() {
  return <Intro currentApp="celebrate-agency" appUrls={getAppUrls()} />;
}
