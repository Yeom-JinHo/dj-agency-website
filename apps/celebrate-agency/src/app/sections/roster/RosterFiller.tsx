import { cn } from "@repo/ui";

import { CornerFrame } from "@/components/Corner";
import { ARROW_NE, BOOKING_EMAIL } from "@/consts/brand";

const FRAME_BASE = "relative mb-[18px] aspect-[3/4]";
const META_LABEL = "flex justify-between font-mono text-[11px] uppercase tracking-[0.08em] lg:text-[13px]";

interface BookingFillerProps {
  visibility: string;
}

export function BookingFiller({ visibility }: BookingFillerProps) {
  return (
    <a
      href={`mailto:${BOOKING_EMAIL}`}
      className={cn(
        "group relative bg-ca-red-cta p-6 transition-colors hover:bg-ca-red-dim",
        visibility,
      )}
    >
      <div className={`${FRAME_BASE} flex flex-col justify-end overflow-hidden border border-ca-fg/20 p-4`}>
        <span className="inline-block origin-bottom-left font-display text-[clamp(40px,4.5vw,64px)] uppercase leading-[0.86] tracking-[-0.005em] text-ca-fg transition-transform duration-500 ease-out group-hover:scale-125">
          Book
          <br />a Set
          <span aria-hidden="true"> {ARROW_NE}</span>
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
