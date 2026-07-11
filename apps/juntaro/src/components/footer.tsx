import type { CSSProperties } from "react";

import { cn } from "@repo/ui";
import { Icon } from "@repo/ui/common/Icon";
import SignatureLink from "@repo/ui/common/SignatureLink";

import { SOCIALS } from "@/consts/socials";

type FooterProps = {
  className?: string;
};

export function Footer({ className }: FooterProps) {
  return (
    <footer
      className={cn(
        "flex items-end justify-between px-6 pb-6 md:px-10 md:pb-8",
        className,
      )}
    >
      <ul className="flex gap-5 md:gap-6">
        {SOCIALS.map(({ name, href, iconName, brandColor }) => (
          <li key={name}>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Juntaro on ${name}`}
              style={{ "--jt-social-hover": brandColor } as CSSProperties}
              // p-1로 히트 영역을 16→24px(WCAG 2.5.8)로 키우고, -m-1로 상쇄해 시각 위치·간격은 불변.
              // 기본은 모노톤(먹색 70%), hover/focus 때만 플랫폼 브랜드색으로 점등.
              className="-m-1 block p-1 text-[#111111]/70 transition-colors duration-200 ease-out hover:text-[var(--jt-social-hover)] focus-visible:text-[var(--jt-social-hover)] motion-reduce:transition-none"
            >
              <Icon name={iconName} size={16} />
            </a>
          </li>
        ))}
      </ul>

      <p className="font-mono text-[11px] tracking-[0.3em] text-[#111111]/55 uppercase">
        Built by{" "}
        <SignatureLink
          href="https://www.instagram.com/ye0m_2/"
          ariaLabel="ye0m2 — Connect on Instagram"
          className="text-[#111111] hover:bg-[length:calc(100%-0.3em)_1px] focus-visible:bg-[length:calc(100%-0.3em)_1px]"
          // 서명이 뷰포트 우측 끝에 붙어 있어 중앙 정렬 툴팁은 화면 밖으로 새어 가로 스크롤을 만든다.
          tooltipClassName="right-0 left-auto translate-x-0 font-mono text-[10px] tracking-[0.2em] text-[#111111] uppercase"
        >
          ye0m2
        </SignatureLink>
      </p>
    </footer>
  );
}
