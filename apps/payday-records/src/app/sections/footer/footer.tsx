import React from "react";
import SignatureLink from "@repo/ui/common/SignatureLink";
import { metadata as meta } from "@/app/config";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-muted/20 flex h-full w-full flex-col justify-between px-8 py-4">
      <div className="flex flex-col items-start justify-between sm:flex-row sm:items-end">
        <p className="mt-4 font-mono text-xs tracking-[0.15em] text-white/55 sm:mt-0 sm:text-sm">
          © {currentYear}{" "}
          <SignatureLink
            href="https://www.instagram.com/ye0m_2/"
            ariaLabel={`${meta.author.name} — Connect on Instagram`}
            accentClassName="text-white"
            tooltipClassName="font-mono uppercase tracking-[0.15em]"
          >
            {meta.author.name}
          </SignatureLink>{" "}
          · All rights reserved
        </p>
      </div>
    </div>
  );
}
