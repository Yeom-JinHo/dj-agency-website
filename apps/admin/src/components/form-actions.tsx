"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * 포커스된 필드와 액션 바 사이에 남길 여유. 폼의 필드 간격(space-y-4)과 같은 값이라
 * "가려지지만 않는" 게 아니라 한 칸 떨어져 멈춘다.
 */
const FOCUS_GAP_PX = 16;

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
  const barRef = useRef<HTMLDivElement>(null);

  // sticky 바는 브라우저의 포커스 스크롤에 보이지 않는다 — 포커스된 필드를 뷰포트
  // 안으로 밀어 넣기만 할 뿐, 그 위를 바가 덮는 건 모른다. 그래서 Tab으로 긴 폼을
  // 훑으면 입력 중인 필드가 바에 깔린다(투어 doorTime에서 55px). 스크롤 끝에서는
  // 바가 제자리로 돌아가 문제가 없다 — 어긋나는 건 포커스 이동 시점뿐이다.
  //
  // 스크롤 컨테이너인 html에 바 높이만큼 scroll-padding-bottom을 줘 브라우저가 그
  // 여백을 빼고 멈추게 한다. 레이아웃은 min-h-svh·min-h-full 체인이라 문서가
  // 스크롤한다(내부 overflow 컨테이너 없음) — documentElement가 맞는 대상이다.
  //
  // 전역 CSS 대신 여기 두는 이유: sticky 바를 만드는 쪽이 그 부작용도 책임져야
  // 목록·대시보드처럼 바가 없는 화면에서 포커스가 괜히 위에 멈추지 않는다.
  // 높이는 재서 쓴다 — 버튼 크기나 폰트가 바뀌면 값도 따라가야 한다.
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const root = document.documentElement;
    const previous = root.style.scrollPaddingBottom;

    // observe 즉시 한 번 발화하므로 초기값도 여기서 정해진다.
    const observer = new ResizeObserver(() => {
      root.style.scrollPaddingBottom = `${bar.offsetHeight + FOCUS_GAP_PX}px`;
    });
    observer.observe(bar);

    return () => {
      observer.disconnect();
      // 지우지 않고 이전 값으로 되돌린다 — 이 컴포넌트가 없던 상태를 그대로 복원해야
      // 폼을 벗어난 화면에 여백이 남지 않는다.
      root.style.scrollPaddingBottom = previous;
    };
  }, []);

  return (
    <div
      ref={barRef}
      className={cn(
        "bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky bottom-0 z-10 flex items-center gap-3 border-t py-4 backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
  );
}
