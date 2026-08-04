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
        // hover만 무채색 대신 아주 옅은 인디고 틴트로 옮긴다(행을 겨눈 순간에만 브랜드가 비친다).
        // 알파는 /[0.03]이 상한이다 — 요청받은 /5(#F4F6FB)면 muted-foreground 셀(아티스트·장소·
        // 일시)이 4.39:1로 AA 아래로 떨어진다. /[0.03]은 4.54:1로, 걷어낸 bg-muted/50과
        // 명도 단차(흰 배경 대비 1.04)까지 같아 hover의 세기는 그대로 두고 색만 바꾼 셈이다.
        "border-b transition-colors hover:bg-primary/[0.03] has-aria-expanded:bg-muted/50 data-[state=selected]:bg-muted",
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
