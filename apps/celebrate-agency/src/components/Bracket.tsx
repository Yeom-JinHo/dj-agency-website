import type { ReactNode } from "react";

export function Bracket({
  children,
  thin = false,
}: Readonly<{ children: ReactNode; thin?: boolean }>) {
  return (
    <span className={thin ? "ca-br ca-br-thin" : "ca-br"}>{children}</span>
  );
}
