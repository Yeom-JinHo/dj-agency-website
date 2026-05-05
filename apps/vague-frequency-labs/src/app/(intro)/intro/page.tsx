import { Intro } from "@repo/ui/features/intro";
import { getAppUrls } from "@repo/utils/app-urls";

export default function IntroPage() {
  return <Intro currentApp="vague-frequency-labs" appUrls={getAppUrls()} />;
}
