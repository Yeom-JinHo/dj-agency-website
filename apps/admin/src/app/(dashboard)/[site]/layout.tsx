import type { ReactNode } from "react";
import { notFound } from "next/navigation";

import { isSiteSlug } from "@/lib/sites";

/**
 * 사이트 세그먼트 가드. 유효하지 않은 site 파라미터는 notFound() —
 * 하위 카테고리 라우트(artists·releases·tours)가 모두 이 가드를 공유한다.
 */
export default async function SiteLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ site: string }> }>) {
  const { site } = await params;
  if (!isSiteSlug(site)) notFound();
  return children;
}
