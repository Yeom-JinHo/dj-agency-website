import Image from "next/image";
import type { ReactNode } from "react";

import icon from "@/app/icon.png";

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-ca-line px-10 pt-20 pb-10">
      <div className="mb-20 grid grid-cols-1 gap-[60px] lg:grid-cols-[1.2fr_1fr]">
        <div>
          <div className="mb-8 font-mono text-[11px] uppercase tracking-[0.08em] text-ca-muted">
            <span className="text-ca-red">●</span>
            &nbsp; [ 06 ] &nbsp; / &nbsp; CONTACT
          </div>
          <h2 className="font-display text-[clamp(72px,11vw,168px)] uppercase leading-[0.88] tracking-[-0.005em]">
            Brief<span className="italic text-ca-red">.</span>
            <br />
            Send<span className="italic text-ca-red">.</span>
          </h2>
        </div>
        <div className="flex flex-col justify-end gap-9">
          <Block title="General & Press">
            <a
              href="mailto:hello@celebrate.agency"
              className="block transition-colors hover:text-ca-red"
            >
              hello@celebrate.agency
            </a>
            <a
              href="mailto:press@celebrate.agency"
              className="block transition-colors hover:text-ca-red"
            >
              press@celebrate.agency
            </a>
          </Block>
          <Block title="Studios">
            Seoul — 38 Seongsui-ro, Seongdong-gu
            <br />
            Los Angeles — 1142 N. Fairfax Ave., 90046
          </Block>
          <Block title="Bookings">
            <a
              href="mailto:book@celebrate.agency"
              className="block transition-colors hover:text-ca-red"
            >
              book@celebrate.agency
            </a>
            <span className="text-ca-muted">
              +82 2 000 0000 · +1 323 000 0000
            </span>
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
              CELEBRATE / AGENCY
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ca-muted">
              Talent · Production · Direction
            </span>
          </div>
        </div>
        <div className="flex flex-wrap gap-6 font-mono text-[11px] uppercase tracking-[0.14em]">
          <a href="#" className="transition-colors hover:text-ca-red">
            Instagram ↗
          </a>
          <a href="#" className="transition-colors hover:text-ca-red">
            Vimeo ↗
          </a>
          <a href="#" className="transition-colors hover:text-ca-red">
            LinkedIn ↗
          </a>
          <a href="#" className="transition-colors hover:text-ca-red">
            Newsletter ↗
          </a>
        </div>
        <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-ca-muted">
          © 2026 Celebrate Agency · All rights reserved · v0.1 draft
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
