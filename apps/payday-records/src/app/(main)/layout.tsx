import type { ReactNode } from "react";
import { Footer, Header } from "../sections";
import IntroDive from "../../components/IntroDive";

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <IntroDive />
      <Header />
      {children}
      <footer>
        <Footer />
      </footer>
    </div>
  );
}
