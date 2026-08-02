import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * 상태 라벨용 뱃지. 이 앱에서 유채색을 쓰는 유일한 자리다 —
 * 상태 오독(매진·취소)은 실제 운영 사고로 이어지므로 라벨만이 아니라 색으로도 가른다.
 * 다크모드를 폐기했으므로 shadcn 원본에 있는 dark: 유틸리티는 옮겨오지 않는다.
 *
 * 변형은 이 앱이 실제로 쓰는 세 가지만 둔다(shadcn 기본 default/secondary는
 * 쓸 자리가 없어 두면 그대로 죽는다). 셋 다 테두리 + 옅은 배경으로 톤을 맞춘다.
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border px-1.5 py-0.5 text-xs whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        neutral: "border-border text-muted-foreground",
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
