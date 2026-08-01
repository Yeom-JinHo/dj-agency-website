import Link from "next/link";

import { Button } from "@/components/ui/button";

/**
 * 루트 404 — (dashboard)/not-found.tsx는 그 라우트 그룹 트리 안에서만 매칭된다.
 * 어떤 라우트에도 매칭되지 않는 URL(/foo/bar 등)은 그 트리에 진입하지 않아
 * Next 기본 영문 404로 떨어진다. 루트 레이아웃(globals.css 적용) 안에서 렌더되므로
 * Tailwind를 그대로 쓸 수 있다. (dashboard) 레이아웃 밖이라 헤더를 붙이려면
 * 인증 조회를 중복해야 해 헤더는 없다.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">페이지를 찾을 수 없습니다</h1>
        <p className="text-muted-foreground text-sm">
          주소가 잘못됐거나 이미 삭제된 항목일 수 있습니다.
        </p>
      </div>
      <Button asChild variant="outline">
        <Link href="/">대시보드로 돌아가기</Link>
      </Button>
    </div>
  );
}
