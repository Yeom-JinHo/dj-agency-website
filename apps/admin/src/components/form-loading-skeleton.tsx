import { Skeleton } from "@/components/ui/skeleton";

/**
 * 상세·새로 만들기(폼 화면) 전용 로딩 폴백. [site]/loading.tsx(테이블형)는 목록·
 * 카테고리 홈에만 맞아 폼 라우트에 뜨면 레이아웃 시프트가 생긴다 — 실제 폼 골격
 * (제목 + 필드 블록 + 하단 액션 바)에 맞춘 스켈레톤을 6개 폼 라우트가 공유한다.
 */
export function FormLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      {/* 폭은 세 폼의 fieldset(max-w-4xl)과 같은 값 — 다르면 로드 직후 폼이 옆으로 튄다. */}
      <div className="max-w-4xl min-w-0 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-9 w-full" />
          </div>
        ))}
        <div className="flex items-center gap-3 border-t py-4">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-20" />
        </div>
      </div>
    </div>
  );
}
