import { createNextConfig, baseConfig } from "@repo/next-config";

export default createNextConfig({
  // sharp는 이미지 업로드(toWebp) 시 서버에서만 로드 — 번들 외부화.
  serverExternalPackages: ["sharp"],
  // sharp의 .node 바이너리는 libvips-cpp.so를 dlopen으로 여는데, 정적 file
  // tracing은 dlopen 의존성을 볼 수 없어 Vercel 함수 패키징에서 누락된다
  // (ERR_DLOPEN_FAILED → sharp를 그래프에 포함한 라우트 전부 500). linux-x64
  // libvips를 강제 포함해 보정한다. 키는 minimatch라 "/[site]/**" 꼴은
  // 대괄호가 문자 클래스로 해석되므로 전체 라우트("/**")에 건다.
  outputFileTracingIncludes: {
    "/**": [
      "../../node_modules/.pnpm/@img+sharp-libvips-linux-x64@*/**",
    ],
  },
  experimental: {
    ...baseConfig.experimental,
    serverActions: {
      // 이미지 업로드 대비 상향 (기본 1mb).
      bodySizeLimit: "10mb",
    },
  },
  // Next는 보안 응답 헤더를 기본으로 붙이지 않는다. 세션 쿠키가 httpOnly가 아니라서
  // (@supabase/ssr 표준 동작 — 브라우저 클라이언트가 읽어야 함) 프레이밍 차단·스니핑
  // 방지가 로그인된 편집자를 지키는 최소 방어선이다. 전체 CSP(script-src 등)는 Next
  // 인라인 스크립트 때문에 nonce 배선이 필요해 frame-ancestors만 우선 적용한다.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains",
          },
        ],
      },
    ];
  },
});
