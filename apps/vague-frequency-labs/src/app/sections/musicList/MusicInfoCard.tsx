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

import { cn } from "@repo/ui";
import { Icon } from "@repo/ui/common/Icon";

interface MusicInfoProps {
  musicInfo: MusicInfo;
  /** "collage": 라벨을 hover에만 노출하는 콜라주용. "default": 카드 아래 라벨 상시 노출. */
  variant?: "default" | "collage";
  /** collage variant일 때 카드(정사각형) 크기 클래스 */
  cardClassName?: string;
}

// 소셜 아이콘 hover 시 각 플랫폼 브랜드 컬러로 점등 (payday-records 패턴과 정합)
// 색은 아이콘을 감싸는 span에 부여 — react-icons가 svg에 인라인 color:currentColor를
// 박으므로, 아이콘 자체에 text-[색]을 주면 인라인에 덮인다. 부모 span 색을 상속시켜 해결.
const SOCIAL_BRAND_HOVER: Record<string, string> = {
  SiYoutube: "group-hover:text-[#FF0000]",
  SiInstagram: "group-hover:text-[#E1306C]",
  SiSoundcloud: "group-hover:text-[#FF5500]",
  SiSpotify: "group-hover:text-[#1ED760]",
  SiApple: "group-hover:text-white",
  SiBeatport: "group-hover:text-[#A8FF04]",
};

function MusicInfoCard({
  musicInfo,
  variant = "default",
  cardClassName,
}: MusicInfoProps) {
  const texture = useMemo(() => {
    // musicInfo.name을 기반으로 결정적 랜덤 생성
    const hash = musicInfo.name.split("").reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    const textureNumber = (Math.abs(hash) % 3) + 1;
    return `/images/texture/${textureNumber}.webp`;
  }, [musicInfo.name]);

  const isCollage = variant === "collage";

  return (
    <Dialog>
      <DialogTrigger>
        <motion.div
          className={cn(
            "group relative overflow-hidden",
            isCollage
              ? cardClassName
              : "h-[150px] w-[150px] md:h-[240px] md:w-[240px] lg:h-[300px] lg:w-[300px] xl:h-[360px] xl:w-[360px] 2xl:h-[400px] 2xl:w-[400px]",
          )}
        >
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
          {isCollage && (
            // 콜라주에서는 라벨을 카드 하단 오버레이로 hover 시에만 노출
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-3 pb-2.5 pt-10 text-left opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <h4 className="truncate text-sm font-semibold text-white">
                {musicInfo.name}
              </h4>
              {musicInfo.artist && (
                <p className="truncate text-xs text-neutral-300">
                  {musicInfo.artist}
                </p>
              )}
            </div>
          )}
        </motion.div>
        {!isCollage && (
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
        )}
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
                    className="group text-muted-foreground hover:text-foreground flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-white/5"
                    key={`contact-social_${index}`}
                  >
                    {social.iconName && (
                      <span
                        className={`inline-flex transition-colors ${
                          SOCIAL_BRAND_HOVER[social.iconName] ?? ""
                        }`}
                      >
                        <Icon name={social.iconName} className="size-5" />
                      </span>
                    )}
                    <span className="text-sm">{social.name}</span>
                    <Icon
                      name="LuArrowRight"
                      className="ml-auto size-4 opacity-60 transition-transform group-hover:translate-x-0.5"
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
