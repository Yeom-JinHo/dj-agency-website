import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // 점 포함 경로(컨벤션 이미지·robots.txt·sitemap.xml 등 정적 파일)와
  // 내부 경로는 middleware를 타지 않는다.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
