import type { FC } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";

const GalaxyBackground = dynamic(
  () => import("@repo/ui/common/GalaxyBackground"),
  { ssr: false }
);

import { cn } from "@repo/ui";
import { buttonVariants } from "@repo/ui/common/Button";

const NotFoundPage: FC = () => {
  return (
    <div className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden">
      <main className="relative h-screen w-screen flex-1">
        <div className="absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-4">
          <h1 className="text-6xl">Page Not Found</h1>
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full self-center rounded-full border border-white/30 bg-white/20 px-8 py-2 text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/30 md:self-start"
            )}
          >
            Home
          </Link>
        </div>

        <div className="absolute inset-0">
          <GalaxyBackground mouseInteraction={false} />
        </div>
      </main>
    </div>
  );
};

export default NotFoundPage;
