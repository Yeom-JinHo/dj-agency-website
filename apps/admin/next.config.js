import { createNextConfig, baseConfig } from "@repo/next-config";

export default createNextConfig({
  // sharp는 이미지 업로드(toWebp) 시 서버에서만 로드 — 번들 외부화.
  serverExternalPackages: ["sharp"],
  experimental: {
    ...baseConfig.experimental,
    serverActions: {
      // 이미지 업로드 대비 상향 (기본 1mb).
      bodySizeLimit: "10mb",
    },
  },
});
