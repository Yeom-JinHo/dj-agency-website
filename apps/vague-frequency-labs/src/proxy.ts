import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Next 16 proxy 컨벤션(middleware.ts 대체). 감지 off + as-needed라 실제 역할은
// 영어 flat URL → /en 내부 rewrite와 /en/* → /* 리다이렉트뿐이다.
export default createMiddleware(routing);

export const config = {
  // 점 포함 경로(컨벤션 이미지·robots.txt·sitemap.xml 등 정적 파일)와
  // 내부 경로는 proxy를 타지 않는다.
  matcher: "/((?!api/|_next/|_vercel/|.*\\..*).*)",
};
