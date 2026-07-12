import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";
import { Footer, Header } from "@/app/sections";

// 오프닝 로더는 여기 두지 않는다 — layout에 두면 지도 없는 서브페이지 라우트의
// 공통 청크·RSC payload에 씬 코드와 좌표(~78KB)가 함께 실린다. 로더(+LoaderProvider)는
// 지도가 있는 홈 page가 직접 렌더한다 (page.tsx 참고).
export default async function MainLayout({
  children,
  params,
}: Readonly<{
  children: ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Header />
      {children}
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
