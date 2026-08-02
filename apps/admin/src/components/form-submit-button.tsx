import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

/**
 * 폼 저장 버튼 + 저장 진행 알림(Artist/Release/Tour 공용).
 *
 * 버튼과 알림을 한 조각으로 묶은 이유: 둘 다 "저장 중"이라는 같은 사실을 다른 감각으로
 * 전달하는 짝이고, 셋으로 흩어 놓으면 문구나 aria 속성이 한쪽만 바뀌는 표류가 생긴다
 * (use-entity-form-submit을 뺀 것과 같은 이유).
 *
 * disabled 대신 aria-disabled인 이유: 제출은 대개 Enter로 시작하는데, 그 순간 포커스를
 * 쥔 버튼이 disabled가 되면 브라우저가 blur시켜 activeElement가 body로 떨어진다 —
 * 키보드 사용자가 탭 위치를 통째로 잃는다. aria-disabled는 포커스를 유지하므로
 * 중복 제출은 use-entity-form-submit의 재진입 가드(submittingRef)가 막는다.
 * 버튼이 fieldset 밖에 있어야 하는 이유도 같다(fieldset disabled가 자손을 전부 끈다).
 *
 * "저장 중…"은 버튼 라벨일 뿐이라 낭독되지 않으므로 진행 상태는 라이브 리전으로
 * 따로 알린다(WCAG 4.1.3). 어휘는 data-table의 검색 결과 알림과 동일하게 맞춘다.
 */
export function FormSubmitButton({
  busy,
  children,
}: {
  busy: boolean;
  children: ReactNode;
}) {
  return (
    <>
      <div aria-live="polite" className="sr-only">
        {busy ? "저장 중입니다" : ""}
      </div>
      <Button
        type="submit"
        aria-disabled={busy}
        // disabled 변형(disabled:opacity-50)과 같은 톤. pointer-events는 끄지 않는다 —
        // 클릭을 막는 건 재진입 가드의 몫이고, 여기서 끄면 hover 피드백까지 사라진다.
        className="aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
      >
        {children}
      </Button>
    </>
  );
}
