"use client";

import type { MusicInfo } from "@/types/music";
import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MorphingDialog as Dialog,
  MorphingDialogContainer as DialogContainer,
  MorphingDialogContent as DialogContent,
  MorphingDialogImage as DialogImage,
  MorphingDialogTrigger as DialogTrigger,
} from "@/components/MorphingDialog";
import { motion } from "motion/react";

import { cn } from "@repo/ui";
import { Icon } from "@repo/ui/common/Icon";
import { buttonVariants } from "@repo/ui/common/Button";

interface MusicInfoProps {
  musicInfo: MusicInfo;
}

function MusicInfoCard({ musicInfo }: MusicInfoProps) {
  const texture = useMemo(() => {
    // musicInfo.name을 기반으로 결정적 랜덤 생성
    const hash = musicInfo.name.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const textureNumber = (Math.abs(hash) % 3) + 1;
    return `/images/texture/${textureNumber}.webp`;
  }, [musicInfo.name]);

  return (
    <Dialog>
      <DialogTrigger>
        <motion.div className="group relative h-[150px] w-[150px] overflow-hidden md:h-[240px] md:w-[240px] lg:h-[300px] lg:w-[300px] xl:h-[360px] xl:w-[360px] 2xl:h-[400px] 2xl:w-[400px]">
          <DialogImage
            width={400}
            height={400}
            src={musicInfo.image}
            alt={musicInfo.name}
            sizes="(max-width: 767px) 150px, (max-width: 1023px) 240px, (max-width: 1279px) 300px, (max-width: 1535px) 360px, 400px"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <Image
            src={texture}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 767px) 150px, (max-width: 1023px) 240px, (max-width: 1279px) 300px, (max-width: 1535px) 360px, 400px"
            className="pointer-events-none object-cover transition-opacity duration-500 group-hover:opacity-0"
          />
        </motion.div>
        <div className="mt-3 w-[150px] text-left md:w-[240px] lg:w-[300px] xl:w-[360px] 2xl:w-[400px]">
          <h4 className="truncate text-sm font-semibold md:text-base">
            {musicInfo.name}
          </h4>
          {musicInfo.artist && (
            <p className="text-muted-foreground truncate text-xs md:text-sm">
              {musicInfo.artist}
            </p>
          )}
        </div>
      </DialogTrigger>
      <DialogContainer>
        <DialogContent
          style={{
            backdropFilter: "blur(11px) saturate(200%)",
            WebkitBackdropFilter: "blur(11px) saturate(200%)",
            backgroundColor: "rgba(17, 25, 40, 0.27)",
            borderRadius: "12px",
            border: "1px solid rgba(255, 255, 255, 0.125)",
          }}
          className="pointer-events-auto relative flex h-auto max-h-[calc(100dvh-5rem)] w-full basis-[90%] flex-col overflow-y-auto p-4 sm:basis-3/4 sm:p-6 md:max-h-none md:basis-1/4 md:overflow-hidden md:p-8"
        >
          <motion.div
            animate={{
              rotate: [0, 360],
              borderRadius: "50%",
              scale: 1,
            }}
            transition={{
              rotate: {
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              },
              borderRadius: { duration: 0.4 },
              scale: { duration: 0.4 },
            }}
            style={{ borderRadius: "50%" }}
            className="aspect-square w-full max-w-[360px] shrink-0 self-center overflow-hidden"
          >
            <DialogImage
              width={360}
              height={360}
              src={musicInfo.image}
              alt={musicInfo.name}
              sizes="(max-width: 768px) 150px, 360px"
              className="h-full w-full object-cover"
            />
          </motion.div>

          <div className="mt-8">
            <h3 className="truncate text-2xl font-bold">{musicInfo.name}</h3>
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-muted-foreground truncate text-sm">
                {musicInfo.artist}
              </h3>
              {musicInfo.label && (
                <p className="text-muted-foreground shrink-0 text-xs">
                  {musicInfo.label}
                </p>
              )}
            </div>
            <div className="mt-4 flex flex-col gap-2 border-t border-border pt-2">
              {musicInfo.socials?.map((social, index) => {
                return (
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href={social.href}
                    className={cn(
                      buttonVariants({ variant: "link" }),
                      "mt-2 h-min w-full gap-1 p-0",
                    )}
                    key={`contact-social_${index}`}
                  >
                    {social.iconName && (
                      <Icon name={social.iconName} className="size-6" />
                    )}
                    <h3 className="text-muted-foreground text-sm">
                      {social.name}
                    </h3>
                    <Icon name="LuArrowRight" className="ml-auto size-4" />
                  </Link>
                );
              })}
            </div>
          </div>
        </DialogContent>
      </DialogContainer>
    </Dialog>
  );
}

export default MusicInfoCard;
