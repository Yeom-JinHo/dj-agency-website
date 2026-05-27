import Image from "next/image";
import { IconDots } from "@tabler/icons-react";

import type { Release } from "@/types/release";

type ReleaseCardProps = {
  release: Release;
  onOpen: () => void;
};

function ReleaseCard({ release, onOpen }: ReleaseCardProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="group block w-[160px] cursor-pointer text-left md:w-[340px]"
      aria-haspopup="dialog"
      aria-label={`${release.title} - ${release.artist} 플랫폼 선택`}
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-lg">
        {release.artwork ? (
          <Image
            src={release.artwork}
            alt={release.title}
            width={340}
            height={340}
            sizes="(max-width: 768px) 160px, 340px"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="relative flex h-full w-full items-center justify-center bg-[#0f0f0f] p-4 text-center">
            <span className="absolute top-0 left-0 h-full w-[3px] bg-orange-500" />
            <span className="line-clamp-3 max-w-[85%] text-lg font-semibold tracking-tight text-white/85 md:text-xl">
              {release.title}
            </span>
          </div>
        )}

        <span className="absolute top-2.5 right-2.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/45 text-white/85 backdrop-blur-sm transition-colors duration-200 group-hover:bg-black/70 group-hover:text-white">
          <IconDots className="h-3.5 w-3.5" stroke={2.5} />
        </span>

        <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/15" />
      </div>

      <div className="mt-3 text-left">
        <h4 className="truncate text-sm font-semibold md:text-base">
          {release.title}
        </h4>
        <p className="text-muted-foreground truncate text-xs md:text-sm">
          {release.artist}
        </p>
        {(release.label || release.catalogNo) && (
          <p className="text-muted-foreground mt-1 truncate font-mono text-[10px] tracking-widest uppercase">
            {[release.label, release.catalogNo].filter(Boolean).join(" · ")}
          </p>
        )}
      </div>
    </button>
  );
}

export default ReleaseCard;
