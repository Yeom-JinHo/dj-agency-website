/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@repo/ui", "@repo/utils", "@repo/content"],
  images: {
    formats: ["image/avif", "image/webp"],
    // 사이트 최대 표시 이미지가 payday hero(900px, 2x=1800→1920 후보)라
    // 기본 deviceSizes의 3840 후보는 어떤 경로로도 쓰이지 않아 제거한다.
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    // Supabase Storage(media 버킷)의 webp를 next/image로 서빙.
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
  },
  experimental: {
    optimizePackageImports: ["@tabler/icons-react", "react-icons", "motion"],
  },
};

export default baseConfig;
