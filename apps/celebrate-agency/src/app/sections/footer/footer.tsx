import Image from "next/image";
import type { ReactNode } from "react";
import SignatureLink from "@repo/ui/common/SignatureLink";

import icon from "@/app/icon.png";
import { metadata as meta } from "@/app/config";
import { AGENCY_ADDRESS, ARROW_NE, BOOKING_EMAIL, SOCIALS } from "@/consts/brand";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-ca-line px-6 pt-16 pb-10 lg:px-10 lg:pt-20"
    >
      <div className="mb-14 grid grid-cols-1 gap-[60px] lg:mb-20 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="mb-8 font-mono text-[11px] uppercase tracking-[0.08em] text-ca-muted lg:text-[13px]">
            <span className="text-ca-red">●</span>
            &nbsp; [ 03 ] &nbsp; / &nbsp; CONTACT
          </div>
          <a
            href={`mailto:${BOOKING_EMAIL}`}
            className="group block transition-colors hover:text-ca-red active:text-ca-red"
          >
            <h2 className="font-display text-[clamp(72px,11vw,168px)] uppercase leading-[0.88] tracking-[-0.005em]">
              Brief
              <span className="italic text-ca-red transition-colors group-hover:text-white group-active:text-white">
                .
              </span>
              <br />
              Send
              <span className="italic text-ca-red transition-colors group-hover:text-white group-active:text-white">
                .
              </span>
            </h2>
            <span className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ca-muted transition-colors group-hover:text-ca-red lg:text-[13px]">
              <span className="inline-block h-2 w-2 bg-ca-red" />
              {BOOKING_EMAIL}
              <span aria-hidden="true">{ARROW_NE}</span>
            </span>
          </a>
        </div>
        <div className="flex flex-col justify-end gap-10">
          <Block title="Bookings">
            <a
              href={`mailto:${BOOKING_EMAIL}`}
              className="block font-display text-[clamp(32px,4vw,48px)] uppercase leading-[0.95] tracking-[0.01em] transition-colors hover:text-ca-red"
            >
              {BOOKING_EMAIL}
            </a>
          </Block>
          <Block title="Studios">
            Seoul — {AGENCY_ADDRESS.streetAddress}
          </Block>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 border-t border-ca-line pt-8 text-center lg:flex-row lg:flex-wrap lg:items-end lg:justify-between lg:gap-10 lg:text-left">
        <div className="flex items-center gap-3.5">
          <Image
            src={icon}
            alt=""
            width={32}
            height={32}
            className="h-8 w-8 rounded-sm"
          />
          <div className="flex flex-col gap-0.5">
            <span className="font-display text-lg tracking-[0.08em]">
              CELEBRATE AGENCY
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ca-muted lg:text-[11px]">
              Talent · Production · Direction
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 font-mono text-[11px] uppercase tracking-[0.14em] lg:text-[13px]">
          <a
            href={SOCIALS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ca-red"
          >
            Instagram <span aria-hidden="true">{ARROW_NE}</span>
          </a>
          <a
            href={SOCIALS.youtube}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ca-red"
          >
            Youtube <span aria-hidden="true">{ARROW_NE}</span>
          </a>
          <span className="text-ca-muted">
            TikTok <span aria-hidden="true">—</span>
          </span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ca-muted lg:text-[11px]">
          © 2026 {meta.site.title}
          <br />
          Built by{" "}
          <SignatureLink
            href={SOCIALS.instagram}
            ariaLabel="ye0m2 — Connect on Instagram"
            className="text-ca-muted hover:text-ca-red focus-visible:text-ca-red"
            tooltipClassName="text-ca-red font-mono text-[10px] uppercase tracking-[0.14em]"
          >
            ye0m2
          </SignatureLink>
        </div>
      </div>
    </footer>
  );
}

function Block({
  title,
  children,
}: Readonly<{ title: string; children: ReactNode }>) {
  return (
    <div>
      <h5 className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ca-muted lg:text-[13px]">
        {title}
      </h5>
      <div className="text-[15px] leading-[1.55] lg:text-base">{children}</div>
    </div>
  );
}
