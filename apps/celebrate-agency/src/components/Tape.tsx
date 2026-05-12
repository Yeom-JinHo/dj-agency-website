import { cn } from "@repo/ui";

type TapePos = "tl" | "tr" | "bl" | "br";

const POSITIONS: Record<TapePos, string> = {
  tl: "top-2 left-2 origin-top-left -rotate-[40deg]",
  tr: "top-2 right-2 origin-top-right rotate-[40deg]",
  bl: "bottom-2 left-2 origin-bottom-left rotate-[40deg]",
  br: "bottom-2 right-2 origin-bottom-right -rotate-[40deg]",
};

export function Tape({ pos }: Readonly<{ pos: TapePos }>) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute h-3 w-12 bg-ca-red/80 shadow-[0_1px_2px_rgba(0,0,0,0.35)]",
        POSITIONS[pos]
      )}
    />
  );
}
