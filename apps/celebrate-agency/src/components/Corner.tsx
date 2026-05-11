type Pos = "tl" | "tr" | "bl" | "br";

const POSITIONS: Record<Pos, string> = {
  tl: "top-0 left-0 border-t-2 border-l-2",
  tr: "top-0 right-0 border-t-2 border-r-2",
  bl: "bottom-0 left-0 border-b-2 border-l-2",
  br: "bottom-0 right-0 border-b-2 border-r-2",
};

export function Corner({ pos }: Readonly<{ pos: Pos }>) {
  return (
    <span
      aria-hidden="true"
      className={`absolute h-[22px] w-[22px] border-ca-red ${POSITIONS[pos]}`}
    />
  );
}
