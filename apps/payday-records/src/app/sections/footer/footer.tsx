import React from "react";
import { metadata as meta } from "@/app/config";

export default function Footer() {
  return (
    <div className="bg-muted/20 flex h-full w-full flex-col justify-between px-8 py-4">
      <div className="flex flex-col items-start justify-between sm:flex-row sm:items-end">
        <p className="mt-4 text-xs sm:mt-0 sm:text-sm md:text-base lg:text-lg xl:text-xl 2xl:text-2xl">
          © {2025} {meta.author.name}
        </p>
      </div>
    </div>
  );
}
