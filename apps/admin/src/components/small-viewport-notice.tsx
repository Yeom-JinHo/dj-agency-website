import { Monitor } from "lucide-react";

/**
 * 좁은 뷰포트에서 앱 대신 표시하는 안내. admin은 데스크톱 전용이라
 * ([site]/layout.tsx·site-sidebar.tsx 참고) 반응형으로 흉내내는 대신 큰 화면으로 유도한다.
 *
 * CSS만으로 판정한다 — matchMedia로 재면 앱을 먼저 그린 뒤 교체하게 되어 깜빡이고
 * 하이드레이션 불일치 위험도 생긴다. 브레이크포인트로 가르면 서버 렌더 시점부터 정확하고
 * 리사이즈·확대에 즉시 따라간다.
 *
 * 임계값 lg(1024px): 사이드바 16rem을 빼면 768px 미만이 남는데 6열 목록 테이블과
 * max-w-4xl 폼이 거기 들어가지 않는다.
 *
 * dialog·select가 z-50을 쓰므로 그 위로 올린다. 뒤쪽 본문은 오버레이로 덮는 게 아니라
 * 레이아웃(app/layout.tsx)에서 display:none으로 내린다 — 덮기만 하면 보이지 않을 뿐
 * 탭 순서와 스크린리더에는 그대로 남는다.
 */
export function SmallViewportNotice() {
  return (
    <div className="bg-background fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 p-6 text-center lg:hidden">
      <Monitor className="text-muted-foreground size-10" aria-hidden />
      <p className="text-base font-medium">더 큰 화면에서 열어주세요</p>
    </div>
  );
}
