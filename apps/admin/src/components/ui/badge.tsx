import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * 상태 라벨용 뱃지. 이 앱에서 유채색을 쓰는 유일한 자리다 —
 * 상태 오독(매진·취소)은 실제 운영 사고로 이어지므로 라벨만이 아니라 색으로도 가른다.
 * 다크모드를 폐기했으므로 shadcn 원본에 있는 dark: 유틸리티는 옮겨오지 않는다.
 *
 * 변형은 이 앱이 실제로 쓰는 세 가지만 둔다(shadcn 기본 default/secondary는
 * 쓸 자리가 없어 두면 그대로 죽는다). 셋 다 테두리 + 옅은 배경으로 톤을 맞춘다 —
 * neutral만 배경이 빠져 있어 주석과 코드가 어긋나 있었고, 그 탓에 목록에서 가장 흔한
 * '예정'이 매진·취소보다 존재감이 약했다. bg-muted/50을 채워 문법을 통일한다.
 * 대비는 #FAFAFA 위 #737373 = 4.54:1로 AA를 넘긴다(muted를 통째로 깔면 4.35:1로
 * 미달하므로 /50이 상한이다).
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-1.5 py-0.5 text-xs whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        neutral: "border-border bg-muted/50 text-muted-foreground",
        // 다가오는 상태(예정) 전용 — 목록에서 운영자가 가장 먼저 찾는 정보인데
        // 종료와 같은 무채색이면 묻힌다. 브랜드 primary를 warning·danger와 같은
        // 문법(테두리 + 옅은 배경)으로 쓴다.
        accent: "border-primary/40 bg-primary/10 text-primary",
        warning: "border-amber-500/40 bg-amber-500/10 text-amber-700",
        danger: "border-red-500/40 bg-red-500/10 text-red-700",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
)

function Badge({
  className,
  variant = "neutral",
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
