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
              : "h-[150px] w-[150px] md:h-[240px] md:w-[240px] lg:h-[300px] lg:w-[300px] xl:h-[360px] xl:w-[360px] 2xl:h-[400px] 2xl:w-[400px]"
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
        <DialogContent className="vfl-music-modal pointer-events-auto relative flex h-auto max-h-[calc(100dvh-5rem)] w-full basis-[90%] flex-col overflow-y-auto overflow-x-hidden rounded-[2px] border border-[rgba(236,234,227,0.22)] bg-[#0a0a0b] text-[#eceae3] shadow-2xl sm:basis-3/4 md:max-h-none md:basis-1/4 md:overflow-hidden">
          <div className="vfl-music-grain" aria-hidden="true" />

          {/* Record — 슬리브 없이 도는 LP 단독. 구조 반전:
              바깥(디스크 전체 면) = 커버 이미지, 안쪽 센터 = 바이닐(다크+그루브+스핀들). */}
          <div className="relative z-10 shrink-0 px-6 pt-8 sm:px-8">
            <motion.div
              className="relative mx-auto aspect-square w-[80%] max-w-[300px] overflow-hidden rounded-full shadow-[0_12px_44px_rgba(0,0,0,0.6)] ring-1 ring-white/5"
              initial={{ scale: 0.92, opacity: 0, rotate: 0 }}
              animate={{ scale: 1, opacity: 1, rotate: 360 }}
              transition={{
                scale: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.4 },
                rotate: {
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                  delay: 0.45,
                },
              }}
            >
              {/* 바깥 = 커버 이미지 (디스크 전체 면) */}
              <Image
                src={musicInfo.image}
                alt={musicInfo.name}
                fill
                sizes="300px"
                className="object-cover"
              />
              {/* 픽처 디스크 광택 */}
              <div
                aria-hidden="true"
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "linear-gradient(125deg, rgba(255,255,255,0.14), transparent 42%)",
                }}
              />
              {/* 안쪽 센터 = 바이닐 캡 (다크 + 그루브 + 스핀들 홀) */}
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-1/2 aspect-square w-[28%] -translate-x-1/2 -translate-y-1/2 rounded-full ring-1 ring-black/50"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, #1b1b1d 0%, #101011 55%, #0a0a0b 100%)",
                }}
              >
                {/* 그루브 링 */}
                <div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      "repeating-radial-gradient(circle at 50% 50%, rgba(236,234,227,0.06) 0px, rgba(236,234,227,0.06) 1px, transparent 1px, transparent 3px)",
                  }}
                />
                {/* 스핀들 홀 */}
                <div className="absolute left-1/2 top-1/2 size-[10%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#0a0a0b] ring-1 ring-white/25" />
              </div>
            </motion.div>
          </div>

          <DialogClose className="z-20 rounded-full bg-black/35 text-white/85 backdrop-blur-sm transition-colors hover:bg-black/60 hover:text-white" />

          {/* Metadata — 커버 아래 컴팩트 블록. 아트의 자체 타이포와 충돌하지 않는다. */}
          <div className="relative z-10 px-4 pb-4 pt-5 sm:px-6 sm:pb-6">
            <DialogTitle>
              <h3 className="line-clamp-2 text-2xl uppercase leading-[1.05] tracking-tight text-[#eceae3]">
                {musicInfo.name}
              </h3>
            </DialogTitle>
            <div className="mt-1.5 flex items-baseline justify-between gap-3">
              {musicInfo.artist && (
                <p className="truncate text-sm font-medium text-[rgba(236,234,227,0.86)] md:text-base">
                  {musicInfo.artist}
                </p>
              )}
              {musicInfo.label && (
                <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-[rgba(236,234,227,0.5)]">
                  {musicInfo.label}
                </span>
              )}
            </div>

            {musicInfo.socials && musicInfo.socials.length > 0 && (
              <div className="mt-5 border-t border-[rgba(236,234,227,0.14)] pt-4">
                <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[rgba(236,234,227,0.55)]">
                  Listen on
                </p>
                <div className="flex flex-col">
                  {musicInfo.socials.map((social, index) => (
                    <Link
                      target="_blank"
                      rel="noopener noreferrer"
                      href={social.href}
                      className="group flex items-center gap-3 rounded-[2px] px-2 py-2.5 text-[rgba(236,234,227,0.72)] transition-colors hover:bg-white/5 hover:text-[#eceae3]"
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
                      <span className="text-sm font-medium">{social.name}</span>
                      <Icon
                        name="LuArrowRight"
                        className="ml-auto size-4 opacity-60 transition-transform group-hover:translate-x-0.5"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </DialogContainer>
    </Dialog>
  );
}

export default MusicInfoCard;
