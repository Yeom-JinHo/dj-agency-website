import type { ArtistProfile } from "@/types/artist";
import Link from "next/link";
import {
  MorphingDialog as Dialog,
  MorphingDialogClose as DialogClose,
  MorphingDialogContainer as DialogContainer,
  MorphingDialogContent as DialogContent,
  MorphingDialogDescription as DialogDescription,
  MorphingDialogImage as DialogImage,
  MorphingDialogSubtitle as DialogSubtitle,
  MorphingDialogTitle as DialogTitle,
  MorphingDialogTrigger as DialogTrigger,
} from "@/components/MorphingDialog";
import TextReveal from "@repo/ui/common/TextReveal";
import { cn } from "@repo/ui";
import { Button } from "@repo/ui/common/Button";

interface ArtistCardProps extends ArtistProfile {
  index: number;
  className?: string;
}

// todo: use text reveal for name and description
// todo: use motion-primitives text-reveal
export default function ArtistCard({
  name,
  nickname,
  shortDescription,
  image,
  className,
  imagePlaceholder,
}: ArtistCardProps) {
  return (
    <Dialog
      transition={{
        type: "tween",
        duration: 0.3,
        ease: "easeInOut",
      }}
    >
      <DialogTrigger
        style={{
          borderRadius: "12px",
        }}
        className={cn(
          "flex flex-col overflow-hidden border border-zinc-950/10 bg-white dark:border-zinc-50/10 dark:bg-zinc-900",
          className
        )}
      >
        <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
          <DialogImage
            src={image ?? "/placeholder.svg"}
            alt={`${name} profile image`}
            className="h-full w-full object-cover"
            width={1280}
            height={720}
            sizes="(max-width: 768px) 50vw, 25vw"
            placeholder="blur"
            blurDataURL={imagePlaceholder}
          />
        </div>
        <div className="lg:p-6 flex grow flex-col items-end justify-between gap-4 p-4">
          <div className="flex w-full flex-col gap-2">
            <DialogTitle className="lg:text-3xl text-2xl leading-8 font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              <TextReveal>{name}</TextReveal>
            </DialogTitle>
            <DialogSubtitle className="text-base text-muted-foreground text-zinc-700 dark:text-zinc-400">
              <TextReveal>@{nickname ?? ""}</TextReveal>
            </DialogSubtitle>
          </div>
        </div>
      </DialogTrigger>
      <DialogContainer>
        <DialogContent
          style={{
            borderRadius: "24px",
          }}
          className="pointer-events-auto relative flex h-auto w-full min-w-[300px] basis-1/2 flex-col overflow-hidden border border-zinc-950/10 bg-white xl:basis-1/4 dark:border-zinc-50/10 dark:bg-zinc-900"
        >
          <div className="relative w-full">
            <DialogImage
              width={1280}
              height={600}
              src={image ?? "/placeholder.svg"}
              alt={`${name} profile image`}
              className="h-[300px] w-full object-cover md:h-[600px]"
              sizes="50vw"
            />
          </div>
          <div className="flex flex-col gap-2 p-6">
            <DialogTitle className="text-3xl leading-8 font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              {name}
            </DialogTitle>
            <DialogDescription
              className="text-base text-muted-foreground text-zinc-700 dark:text-zinc-400"
              variants={{
                initial: { opacity: 0 },
                animate: { opacity: 1 },
                exit: { opacity: 0 },
              }}
            >
              <div className="dark:prose-invert prose text-muted-foreground prose-p:leading-relaxed prose-pre:p-0 min-w-full break-words">
                <p className="mb-2 last:mb-0">{shortDescription}</p>
              </div>
            </DialogDescription>
          </div>
          <div className="flex justify-center p-6">
            <Button asChild className="w-full font-bold">
              <Link href={`/artist/${name}`}>View Details</Link>
            </Button>
          </div>
          <DialogClose className="text-zinc-50" />
        </DialogContent>
      </DialogContainer>
    </Dialog>
  );
}
