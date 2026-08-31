import { createNextConfig } from "@repo/next-config";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

export default withNextIntl({
  ...createNextConfig(),
  // `/en/*`는 영구 별칭 — next-intl proxy의 307(임시) 대신 308로 색인 신호를 flat URL로 넘긴다.
  // config redirects는 proxy보다 먼저 평가되므로 proxy는 /en/*를 보지 않는다.
  async redirects() {
    return [
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/:path*", destination: "/:path*", permanent: true },
    ];
  },
});
