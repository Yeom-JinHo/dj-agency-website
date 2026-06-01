import type { JSX, ReactNode } from "react";
import TextReveal from "@repo/ui/common/TextReveal";
import { cn } from "@repo/ui";

const headingVariants = {
  /** 섹션 내부 제목 (h2) */
  section:
    "text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight",
  /** 페이지 최상단 대제목 (h1) */
  page: "text-5xl leading-tight tracking-tight sm:text-6xl md:text-6xl lg:text-7xl xl:text-8xl 2xl:text-9xl",
} as const;

interface SectionHeadingProps {
  children: ReactNode;
  variant?: keyof typeof headingVariants;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

/**
 * 페이지/섹션 제목의 타입 스케일을 단일 출처로 관리한다.
 * 내부적으로 TextReveal(단어별 진입 모션)을 그대로 사용한다.
 */
export default function SectionHeading({
  children,
  variant = "section",
  as = "h2",
  className,
}: SectionHeadingProps) {
  return (
    <TextReveal as={as} className={cn(headingVariants[variant], className)}>
      {children}
    </TextReveal>
  );
}
