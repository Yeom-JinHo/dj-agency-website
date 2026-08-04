import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * 긴 폼의 sticky 액션 바(Artist/Release/Tour 공용, 엔티티 비종속).
 * 폼 하단에 두면 스크롤과 무관하게 뷰포트 하단에 고정돼 저장/취소 접근성을 유지한다.
 * children으로 submit·취소 버튼을 좌측에 슬롯한다. 파괴적 액션(삭제)은 넣지 않는다.
 */
export function FormActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      // 불투명 배경 — 반투명(80~95%)+blur는 스크롤 중간에 바 뒤로 필드 라벨이
      // 반쯤 판독되는 상태를 만들었다(designer 독립 리뷰). 바 아래 콘텐츠는
      // "가려져 있다"가 읽기 어중간하게 "비쳐 보인다"보다 낫다.
      className={cn(
        "bg-background sticky bottom-0 z-10 flex items-center gap-3 border-t py-4",
        className,
      )}
    >
      {children}
    </div>
  );
}
