import { Intro } from "@repo/ui/features/intro";
import { getAppUrls } from "@repo/utils/app-urls";

import { createMetadata } from "@/utils";

export const metadata = {
  ...createMetadata({
    title: "Intro",
    description: "Enter Celebrate Agency — Talent · Production · Direction.",
  }),
  // Gate/entry page — noindex but keep links followable (standard for gates).
  robots: { index: false, follow: true },
};

export default function IntroPage() {
  return <Intro currentApp="celebrate-agency" appUrls={getAppUrls()} />;
}
