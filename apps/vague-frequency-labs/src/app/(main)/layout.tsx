import type { ReactNode } from "react";
import { Footer, Header } from "../sections";
import Loader from "./loader";
import { LoaderProvider } from "./loader-context";
import { getWorldMapData } from "@/utils/world-map-data";

export default function MainLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // Built server-side; only the landing points/dims reach the client, so the
  // loader scene needs no dotted-map import.
  const { points, width, height } = getWorldMapData();
  return (
    <LoaderProvider mapData={{ points, width, height }}>
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
