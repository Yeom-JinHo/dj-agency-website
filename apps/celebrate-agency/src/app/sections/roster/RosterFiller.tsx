import { IconArrowUpRight } from "@tabler/icons-react";
import { cn } from "@repo/ui";

import { CornerFrame } from "@/components/Corner";
import { ARROW_NE, BOOKING_MAILTO } from "@/consts/brand";

const FRAME_BASE = "relative mb-[18px] aspect-[3/4]";
const META_LABEL = "flex justify-between font-mono text-[11px] uppercase tracking-[0.08em] lg:text-[13px]";

interface BookingFillerProps {
  visibility: string;
}

export function BookingFiller({ visibility }: BookingFillerProps) {
  return (
    <a
      href={BOOKING_MAILTO}
      className={cn(
        "group relative bg-ca-red-cta p-6 transition-colors hover:bg-ca-red-dim active:bg-ca-red-dim focus-visible:z-10 focus-visible:outline-ca-fg",
        visibility,
      )}
    >
      <div className={`${FRAME_BASE} flex flex-col justify-end overflow-hidden border border-ca-fg/20 p-4`}>
        {/* 인터랙션 스케일 규칙: 텍스트류는 큰 확대 대신 미세 스케일 + 화살표 넛지.
            (기존 1.25는 규칙 밖 과대 배율이라 하향) */}
        <span className="inline-block origin-bottom-left font-display text-[clamp(40px,4.5vw,64px)] uppercase leading-[0.86] tracking-[-0.005em] text-ca-fg transition-transform duration-300 ease-out group-hover:scale-[1.04] group-active:scale-[1.04]">
          Book
          <br />a Set
          <IconArrowUpRight
            aria-hidden="true"
            className="ml-[0.1em] inline-block size-[0.8em] align-[-0.02em] transition-transform duration-300 ease-out group-hover:translate-x-[0.06em] group-hover:-translate-y-[0.06em] group-active:translate-x-[0.06em] group-active:-translate-y-[0.06em]"
            stroke={2.75}
          />
        </span>
      </div>
      <div className="mb-1.5 font-display text-3xl uppercase leading-none tracking-[0.01em] text-ca-fg">
        Booking
      </div>
      <div className={`${META_LABEL} text-ca-fg`}>
        <span>Brief</span>
        <span>MAIL {ARROW_NE}</span>
      </div>
    </a>
  );
}

interface ReservedFillerProps {
  visibility: string;
  /** 2-digit slot label to render inside the bracket — e.g. "08" → "[ 08 ]". */
  slotLabel: string;
}

export function ReservedFiller({ visibility, slotLabel }: ReservedFillerProps) {
  return (
    <div className={cn("relative bg-ca-bg p-6", visibility)}>
      <div className={`${FRAME_BASE} ca-stripe-ph overflow-hidden border border-ca-line`}>
        <CornerFrame />
        <span className="absolute inset-0 flex items-center justify-center font-display text-[clamp(48px,6vw,80px)] uppercase leading-none tracking-[0.02em] text-ca-dim">
          [ {slotLabel} ]
        </span>
      </div>
      <div className="mb-1.5 font-display text-3xl uppercase leading-none tracking-[0.01em] text-ca-muted">
        Reserved
      </div>
      <div className={`${META_LABEL} text-ca-muted`}>
        <span>By invitation</span>
        <span aria-hidden="true">—</span>
      </div>
    </div>
  );
}
