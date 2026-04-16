import type { ReactNode } from "react";
import { Footer, Header } from "../sections";

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <Header />
      {children}
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
