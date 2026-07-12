import { Intro } from "@repo/ui/features/intro";
import { getAppUrls } from "@repo/utils/app-urls";

export default function NotFoundPage() {
  return (
    <Intro
      currentApp="vague-frequency-labs"
      appUrls={getAppUrls()}
      notice="404 — page not found"
    />
  );
}
