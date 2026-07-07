import type { ReactNode } from "react";
import { Footer, Header } from "../sections";
import Loader from "./loader";
import { LoaderProvider } from "./loader-context";

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <LoaderProvider>
      <div className="flex min-h-[100dvh] flex-col">
        <Loader />
        <Header />
        {children}
        <footer>
          <Footer />
        </footer>
      </div>
    </LoaderProvider>
  );
}
