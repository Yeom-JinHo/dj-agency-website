"use client";

import type { MusicInfo } from "@/types/music";
import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MorphingDialog as Dialog,
  MorphingDialogClose as DialogClose,
  MorphingDialogContainer as DialogContainer,
  MorphingDialogContent as DialogContent,
  MorphingDialogImage as DialogImage,
  MorphingDialogTitle as DialogTitle,
  MorphingDialogTrigger as DialogTrigger,
} from "@/components/MorphingDialog";
import { motion } from "motion/react";

import { Icon } from "@repo/ui/common/Icon";

interface MusicInfoProps {
  musicInfo: MusicInfo;
}

// 소셜 아이콘 hover 시 각 플랫폼 브랜드 컬러로 점등 (payday-records 패턴과 정합)
const SOCIAL_BRAND_HOVER: Record<string, string> = {
  SiYoutube: "group-hover/social:text-[#FF0000]",
  SiInstagram: "group-hover/social:text-[#E1306C]",
  SiSoundcloud: "group-hover/social:text-[#FF5500]",
  SiSpotify: "group-hover/social:text-[#1ED760]",
  SiApple: "group-hover/social:text-white",
  SiBeatport: "group-hover/social:text-[#A8FF04]",
};

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
        <motion.div className="group relative h-[150px] w-[150px] overflow-hidden sm:h-[240px] sm:w-[240px] md:h-[360px] md:w-[360px]">
          <DialogImage
            width={360}
            height={360}
            src={musicInfo.image}
            alt={musicInfo.name}
            sizes="(max-width: 640px) 150px, (max-width: 768px) 240px, 360px"
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
          <Image
            src={texture}
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 640px) 150px, (max-width: 768px) 240px, 360px"
            className="pointer-events-none object-cover transition-opacity duration-500 group-hover:opacity-0"
          />
        </motion.div>
        <div className="mt-3 w-[150px] text-left sm:w-[240px] md:w-[360px]">
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
          className="bg-popover/60 text-popover-foreground pointer-events-auto relative flex h-auto max-h-[calc(100dvh-5rem)] w-full basis-[90%] flex-col overflow-y-auto rounded-lg border border-white/10 p-4 shadow-xl backdrop-blur-xl backdrop-saturate-150 sm:basis-3/4 sm:p-6 md:max-h-none md:basis-1/4 md:overflow-hidden md:p-8"
        >
          <DialogClose className="text-muted-foreground hover:text-foreground z-10" />
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

          <div className="mt-6">
            <DialogTitle>
              <h3 className="line-clamp-2 text-xl font-semibold">
                {musicInfo.name}
              </h3>
            </DialogTitle>
            <div className="mt-0.5 flex items-center justify-between gap-3">
              <p className="text-muted-foreground truncate text-sm">
                {musicInfo.artist}
              </p>
              {musicInfo.label && (
                <p className="text-muted-foreground shrink-0 text-xs">
                  {musicInfo.label}
                </p>
              )}
            </div>
            {musicInfo.socials && musicInfo.socials.length > 0 && (
              <div className="border-border mt-6 flex flex-col gap-1 border-t pt-4">
                {musicInfo.socials.map((social, index) => (
                  <Link
                    target="_blank"
                    rel="noopener noreferrer"
                    href={social.href}
                    className="group/social text-muted-foreground hover:text-foreground flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-white/5"
                    key={`contact-social_${index}`}
                  >
                    {social.iconName && (
                      <Icon
                        name={social.iconName}
                        className={`size-5 transition-colors ${
                          SOCIAL_BRAND_HOVER[social.iconName] ?? ""
                        }`}
                      />
                    )}
                    <span className="text-sm">{social.name}</span>
                    <Icon
                      name="LuArrowRight"
                      className="ml-auto size-4 opacity-60 transition-transform group-hover/social:translate-x-0.5"
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </DialogContainer>
    </Dialog>
  );
}

export default MusicInfoCard;
