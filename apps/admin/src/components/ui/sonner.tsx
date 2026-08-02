"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      /* 토스트는 삭제·발행·로그인·이미지 실패의 유일한 채널이다. sonner 기본값은 4초 자동
         소멸에 닫기 버튼도 없어서, 화면을 200~400%로 확대한 사용자가 우하단으로 시선을
         옮기기 전에 사라지고 스크린리더 낭독이 잘리면 다시 읽을 방법이 없었다
         (WCAG 2.2.1 Timing Adjustable). 오류 토스트의 duration: Infinity는 호출부에서 준다.
         덤으로 Tab 도달성도 해결된다 — 토스트 컨테이너는 tabIndex={-1}이라 ⌥T 핫키로만
         닿았는데, 닫기 버튼이 생기면 컨테이너가 포커스 가능한 자식을 갖게 된다. */
      closeButton
      toastOptions={{
        classNames: {
          /* sonner 기본 포커스 링은 rgba(0,0,0,0.2) 2px이라 흰 토스트 위에서 1.6:1까지
             떨어진다. 위에서 Tab으로 닿게 만들어 놓고 닿은 표시가 안 보이면 의미가 없어
             앱 공통 어휘로 덮는다. !가 붙은 이유는 sonner 선택자가
             [data-sonner-toast][data-styled][data-close-button]:focus-visible로 유틸리티보다
             구체적이라 그냥은 box-shadow 싸움에서 진다. */
          closeButton: "focus-visible:ring-ring/50! focus-visible:ring-[3px]!",
        },
      }}
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
          /* 닫기 버튼만 --normal-* 대신 sonner 내부 회색 스케일을 쓴다(색 gray12, 테두리
             gray4). 배경은 이미 --normal-bg를 타므로 나머지 둘만 앱 토큰으로 돌린다.
             테두리는 흰 배경 대비 3:1에 못 미치지만, 식별은 거의 검은 X 글리프가 맡고
             테두리는 경계 장식이라 WCAG 1.4.11의 예외에 해당한다 — 여기만 진한 회색 원을
             두르면 앱 전체의 1px 경계 어휘에서 혼자 튄다. */
          "--gray12": "var(--popover-foreground)",
          "--gray4": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
