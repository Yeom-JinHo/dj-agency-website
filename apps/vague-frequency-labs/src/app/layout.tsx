import type { ReactNode } from "react";
import type { Metadata } from "next";
import { baseUrl } from "@/utils";

// 실제 <html>은 [locale]/layout.tsx가 렌더한다. 이 passthrough는 proxy에
// 매칭되지 않는 경로(점 포함 미지 URL 등)가 루트 not-found.tsx를 렌더할 수 있게
// 하기 위해서만 존재한다 — next-intl error-files 구성.
// metadataBase는 여기서 공급해야 루트 404가 opengraph-image 컨벤션 파일을
// localhost 기준으로 해석하지 않는다.
export const metadata: Metadata = { metadataBase: new URL(baseUrl) };

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
