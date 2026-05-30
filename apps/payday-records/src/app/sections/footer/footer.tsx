import React from "react";
import { metadata as meta } from "@/app/config";

import { copyright } from "./config";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const yearLabel =
    copyright.startYear === currentYear
      ? `${currentYear}`
      : `${copyright.startYear}–${currentYear}`;

  return (
    <div className="bg-muted/20 flex h-full w-full flex-col justify-between px-8 py-4">
      <div className="flex flex-col items-start justify-between sm:flex-row sm:items-end">
        <p className="mt-4 font-mono text-xs tracking-[0.2em] text-white/55 uppercase sm:mt-0 sm:text-sm">
          © {yearLabel} {meta.site.title}
        </p>
      </div>
    </div>
  );
}
