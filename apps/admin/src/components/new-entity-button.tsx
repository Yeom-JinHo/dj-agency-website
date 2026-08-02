"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { withSearch } from "@/lib/list-search";
import { Button } from "@/components/ui/button";

/**
 * 목록 우상단 "새 X" 버튼. 현재 검색·정렬 쿼리를 `/new`까지 실어 보내려고 클라이언트
 * 컴포넌트로 둔다 — 검색은 nuqs shallow 갱신이라 서버 컴포넌트인 목록 페이지가 타이핑에
 * 다시 렌더되지 않고, 그래서 서버가 만든 href는 첫 진입 시점 쿼리에 멈춰 있다.
 * 행 링크(DataTable)가 useSearchParams로 쿼리를 실어 보내는 것과 같은 이유·같은 방식이다.
 * 폼은 쿼리 없는 listHref를 받아 useSearchParams로 되붙이므로(use-entity-form-submit),
 * URL에 실어두기만 하면 `/new`에서 저장·취소해도 검색 상태 그대로 목록에 돌아온다.
 */
export function NewEntityButton({
  href,
  children,
}: {
  /** 쿼리 없는 `/new` 경로. 현재 쿼리는 이 컴포넌트가 붙인다. */
  href: string;
  children: ReactNode;
}) {
  const searchParams = useSearchParams();

  return (
    <Button asChild>
      <Link href={withSearch(href, searchParams)}>{children}</Link>
    </Button>
  );
}
