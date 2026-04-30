import Link from "next/link";
import GalaxyBackground from "@repo/ui/common/GalaxyBackground";

import { cn } from "@repo/ui";
import { buttonVariants } from "@repo/ui/common/Button";

export default function CelebrateAgencyPage() {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <main className="relative h-screen w-screen flex-1">
        <div className="align-center absolute top-1/2 left-1/2 z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col gap-4">
          <h1 className="text-6xl">Coming Soon</h1>
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
}
