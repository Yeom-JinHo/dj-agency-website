"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * containerClassName·containerRef는 스크롤 컨테이너(바깥 div)를 소비처가 다루기 위한 통로다.
 * sticky 헤더를 쓰려면 이 컨테이너가 세로 스크롤포트여야 해서 높이를 밖에서 정해야 하는데,
 * 그 값은 화면마다 다르므로 프리미티브가 들고 있을 수 없다. 스크롤 위치를 되감는 것도
 * 스크롤포트가 여기라 이 div를 직접 잡아야 한다. className은 종전대로 <table>에 간다.
 *
 * overflow-x-auto → overflow-auto: 가로만 auto로 두면 브라우저가 overflow-y를 auto로 승격시켜
 * 이 컨테이너가 '스크롤되지 않는 스크롤포트'가 된다. 그 안의 sticky는 뷰포트가 아니라 이 컨테이너를
 * 기준으로 삼는데 컨테이너가 세로로 움직이지 않으니 sticky가 조용히 무력해진다(실측: 스크롤 900px에서
 * thead가 top 101px → -800px로 밀려남). 두 축을 함께 auto로 선언해 이 컨테이너를 진짜 스크롤포트로 만든다.
 */
function Table({
  className,
  containerClassName,
  containerRef,
  ...props
}: React.ComponentProps<"table"> & {
  containerClassName?: string
  containerRef?: React.Ref<HTMLDivElement>
}) {
  return (
    <div
      ref={containerRef}
      data-slot="table-container"
      className={cn("relative w-full overflow-auto", containerClassName)}
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t bg-muted/50 font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b",
        // ── 행 "겨눔" 상태 — 두 축(틴트 + 좌측 레일)을 hover와 키보드 포커스가 함께 쓴다.
        //
        // 틴트: 무채색 대신 아주 옅은 인디고(행을 겨눈 순간에만 브랜드가 비친다).
        // 알파 /[0.03]은 취향이 아니라 천장이다. muted-foreground 셀(slug·아티스트·장소·일시)이
        // 흰 배경에서 이미 4.742:1뿐이라 배경을 조금만 어둡게 해도 AA 4.5:1이 깨진다 —
        // /[0.04]=4.47, /[0.05]=4.39, /[0.06]=4.31, 무채색 bg-muted(#F5F5F5)조차 4.35로 미달.
        // /[0.03](#F9FAFC)만 4.540:1로 살아남는다. 즉 배경 축으로는 이 이상 세게 할 수 없다.
        //
        // 레일: 그래서 대비와 무관한 두 번째 축을 첫 셀 안쪽 그림자로 세운다. 텍스트 대비를
        // 건드리지 않으면서 1.4.11(3:1)을 7.64:1로 크게 넘겨, 1.03:1짜리 틴트 혼자서는
        // 사실상 보이지 않던 "클릭 가능한 행"을 실제로 읽히게 만든다. border가 아니라
        // inset shadow인 이유는 레이아웃을 차지하지 않아 미겨눔 상태에 자리를 비워둘
        // 필요가 없어서다. td에만 걸어 thead(th)에는 레일이 생기지 않는다.
        //
        // hover와 focus를 같은 값으로 둔 건 둘이 같은 사실("이 행이 대상이다")을 말하기
        // 때문이다. 값을 다르게 하면 어휘가 둘로 늘고, 마우스를 올린 채 링크에 포커스가
        // 있는 흔한 겹침에서 어느 쪽이 이겼는지가 무의미한 질문이 된다.
        // 포커스 트리거는 a에만 건다 — thead 정렬 버튼은 <button>이라 행이 밝아지지 않는다.
        // "어디에 포커스가 있는지"는 링크 자신의 ring이 계속 말하고, 여기 두 축은 보조 신호다.
        "transition-colors hover:bg-primary/[0.03] has-[a:focus-visible]:bg-primary/[0.03]",
        "[&>td:first-child]:transition-shadow",
        "hover:[&>td:first-child]:shadow-[inset_2px_0_0_var(--color-primary)]",
        "has-[a:focus-visible]:[&>td:first-child]:shadow-[inset_2px_0_0_var(--color-primary)]",
        "has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
        className
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("mt-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
