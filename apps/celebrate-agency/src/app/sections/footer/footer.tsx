import Image from "next/image";
import type { ReactNode } from "react";

import icon from "@/app/icon.png";
import { BOOKING_EMAIL } from "@/consts/brand";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="border-t border-ca-line px-10 pt-16 pb-10 lg:pt-20"
    >
      <div className="mb-14 grid grid-cols-1 gap-[60px] lg:mb-20 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="mb-8 font-mono text-[11px] uppercase tracking-[0.08em] text-ca-muted">
            <span className="text-ca-red">●</span>
            &nbsp; [ 04 ] &nbsp; / &nbsp; CONTACT
          </div>
          <a
            href={`mailto:${BOOKING_EMAIL}`}
            className="group block transition-colors hover:text-ca-red"
          >
            <h2 className="font-display text-[clamp(72px,11vw,168px)] uppercase leading-[0.88] tracking-[-0.005em]">
              Brief<span className="italic text-ca-red">.</span>
              <br />
              Send<span className="italic text-ca-red">.</span>
            </h2>
            <span className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ca-muted transition-colors group-hover:text-ca-red">
              <span className="inline-block h-2 w-2 bg-ca-red" />
              {BOOKING_EMAIL}
              <span aria-hidden="true">↗</span>
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
            <span className="mt-3 block font-mono text-[11px] uppercase tracking-[0.08em] text-ca-muted">
              +82 2 000 0000
            </span>
          </Block>
          <Block title="Studios">
            Seoul — 38 Seongsui-ro, Seongdong-gu
          </Block>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-10 border-t border-ca-line pt-8">
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
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ca-muted">
              Talent · Production · Direction
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 font-mono text-[11px] uppercase tracking-[0.14em]">
          <a
            href="https://www.instagram.com/ye0m_2/"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ca-red"
          >
            Instagram <span aria-hidden="true">↗</span>
          </a>
          <a
            href="https://www.youtube.com/@ye0m_2"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-ca-red"
          >
            Youtube <span aria-hidden="true">↗</span>
          </a>
          <span className="text-ca-muted">
            TikTok <span aria-hidden="true">—</span>
          </span>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ca-muted">
          © 2026 ye0m2 · All rights reserved
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
      <h5 className="mb-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-ca-muted">
        {title}
      </h5>
      <div className="text-[15px] leading-[1.55]">{children}</div>
    </div>
  );
}
