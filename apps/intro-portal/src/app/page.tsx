import { Intro } from "@repo/ui/features/intro";
import { getAppUrls } from "@repo/utils/app-urls";

// Brand-neutral portal: this app is not one of the three brands, so no
// `currentApp` is passed. Every entry resolves to an external brand URL —
// there is no self `/` navigation here.
export default function IntroPortalPage() {
  return <Intro appUrls={getAppUrls()} />;
}
