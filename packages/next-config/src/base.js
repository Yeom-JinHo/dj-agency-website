// /_next/image는 무인증 공개 엔드포인트라 remotePatterns가 곧 변환 허용 범위다.
// "**.supabase.co" 와일드카드는 제3자 Supabase 프로젝트 이미지까지 변환해 주는
// 열린 프록시(변환 건수 과금 악용 표면)가 되므로, 빌드 타임에 우리 프로젝트
// 호스트(NEXT_PUBLIC_SUPABASE_URL 파생) + media 버킷 공개 경로로만 고정한다.
// env 미설정 빌드는 mediaUrl이 null이라 CMS 이미지 자체가 없으므로 패턴도 생략.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const remotePatterns = supabaseUrl
  ? [
      {
        protocol: "https",
        hostname: new URL(supabaseUrl).hostname,
        pathname: "/storage/v1/object/public/media/**",
      },
    ]
  : [];

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
    remotePatterns,
  },
  experimental: {
    optimizePackageImports: ["@tabler/icons-react", "react-icons", "motion"],
  },
};

export default baseConfig;
