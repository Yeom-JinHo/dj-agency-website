import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * 목록이 비었을 때의 공용 빈 상태(아티스트·릴리즈·투어 공유, 엔티티 비종속).
 * 한 줄 안내문은 "다음에 뭘 해야 하나"를 시선에서 놓치기 쉬워, 아이콘·설명과
 * 함께 CTA를 상자 안으로 끌어온다. 목록이 있을 때의 우상단 버튼은 그대로 두고
 * 빈 상태에서만 이 CTA가 쓰이므로 화면에 CTA가 둘 겹치지 않는다.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed px-6 py-16 text-center",
        className
      )}
    >
      {/* 원형 아이콘만 primary 틴트로 둔다 — 신규 사이트 세팅 초기에 가장 자주 보는 화면인데
          완전 무채색이면 "비었다"로만 읽히고 "채울 자리"라는 초대가 되지 않았다.
          바로 아래 CTA(primary 버튼)와 색을 이어 시선이 아이콘 → 문구 → 버튼으로 흐른다.
          #EAEDF6 위 #2B4EA7 = 6.52:1. */}
      <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-full">
        <Icon className="size-5" aria-hidden />
      </div>
      <div className="space-y-1">
        <h2 className="text-base font-medium">{title}</h2>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
