/** @type {import('next').NextConfig} */
const baseConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  transpilePackages: ["@repo/ui", "@repo/utils"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizePackageImports: ["@tabler/icons-react", "react-icons", "motion"],
  },
};

export default baseConfig;
