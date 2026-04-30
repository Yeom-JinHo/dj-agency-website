import type { ReactNode } from "react";

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return <div className="flex min-h-[100dvh] flex-col">{children}</div>;
}
