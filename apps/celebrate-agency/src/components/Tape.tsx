import { cn } from "@repo/ui";

type TapePos = "tl" | "tr" | "bl" | "br";

const POSITIONS: Record<TapePos, string> = {
  tl: "top-0 left-0 -translate-x-1/3 -translate-y-1/3 -rotate-[35deg]",
  tr: "top-0 right-0 translate-x-1/3 -translate-y-1/3 rotate-[35deg]",
  bl: "bottom-0 left-0 -translate-x-1/3 translate-y-1/3 rotate-[35deg]",
  br: "bottom-0 right-0 translate-x-1/3 translate-y-1/3 -rotate-[35deg]",
};

export function Tape({ pos }: Readonly<{ pos: TapePos }>) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute h-2.5 w-10 bg-ca-red/45",
        POSITIONS[pos]
      )}
    />
  );
}
