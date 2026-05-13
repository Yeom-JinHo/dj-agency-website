import type { ReactNode } from "react";

type Props = Readonly<{
  num: string;
  numLabel: string;
  title: string;
  aside?: ReactNode;
}>;

export function SectionHead({ num, numLabel, title, aside }: Props) {
  return (
    <div className="mb-10 grid grid-cols-1 items-start gap-6 px-6 lg:mb-16 lg:grid-cols-[200px_1fr_200px] lg:gap-10 lg:px-10">
      <div className="pt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-ca-muted">
        <span className="text-ca-red">[ {num} ]</span>
        &nbsp; / &nbsp;
        {numLabel}
      </div>
      <h2 className="font-display text-[clamp(48px,7vw,96px)] uppercase leading-[0.9] tracking-[-0.005em]">
        {title}
        <span className="text-ca-red">.</span>
      </h2>
      <div className="text-right text-[13px] leading-[1.55] text-ca-muted">
        {aside}
      </div>
    </div>
  );
}
