import type { Metadata } from "next";
import { Intro } from "@repo/ui/features/intro";
import { getAppUrls } from "@repo/utils/app-urls";

import "@/styles/globals.css";

import { fontClassName } from "@/app/fonts";

// 유일한 404. 루트 layout이 passthrough라 여기서 자체 <html>을 렌더한다.
// [locale] 하위 미지 경로·미지 locale·점 포함 경로 전부 라우터 단계에서 이
// 정적 _not-found로 떨어진다 — 세그먼트 안에서 notFound()를 던지는 동적 404는
// Next 16이 빈 <html id="__next_error__"> 셸로 SSR해 JS 없는 크롤러에 백지가 된다.
// locale은 라우터 단계라 알 수 없으므로 영어 고정, 홈 링크는 "/".
export const metadata: Metadata = {
  // robots noindex는 Next가 not-found에 자동 부여한다.
  title: "404 — page not found | Vague Frequency Laboratory",
};

export default function NotFound() {
  return (
    <html lang="en" className="dark">
      <body className={fontClassName}>
        <Intro
          currentApp="vague-frequency-labs"
          appUrls={getAppUrls()}
          notice="404 — page not found"
        />
      </body>
    </html>
  );
}
