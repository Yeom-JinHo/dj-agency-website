import React from "react";
import SignatureLink from "@repo/ui/common/SignatureLink";
import { metadata as meta } from "@/app/config";

export default function Footer() {
  return (
    <div className="border-t border-white/[0.08] bg-muted/20 flex h-full w-full flex-col justify-between px-6 py-4 md:px-10">
      <div className="flex flex-col items-start sm:flex-row sm:items-end sm:justify-end">
        <p className="mt-4 font-mono text-xs tracking-[0.15em] text-white/55 sm:mt-0 sm:text-sm">
          © 2026 {meta.site.title}
          <span className="hidden sm:inline"> · </span>
          <br className="sm:hidden" />
          Built by{" "}
          <SignatureLink
            href="https://www.instagram.com/ye0m_2/"
            ariaLabel={`${meta.author.name} — Connect on Instagram`}
            className="hover:text-pd-accent focus-visible:text-pd-accent"
            tooltipClassName="text-white font-mono uppercase tracking-[0.15em]"
          >
            {meta.author.name}
          </SignatureLink>
        </p>
      </div>
    </div>
  );
}
