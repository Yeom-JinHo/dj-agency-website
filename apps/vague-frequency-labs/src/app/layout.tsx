import type { ReactNode } from "react";

// 실제 <html>은 [locale]/layout.tsx가 렌더한다. 이 passthrough는 middleware에
// 매칭되지 않는 경로(점 포함 미지 URL 등)가 루트 not-found.tsx를 렌더할 수 있게
// 하기 위해서만 존재한다 — next-intl error-files 구성.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
