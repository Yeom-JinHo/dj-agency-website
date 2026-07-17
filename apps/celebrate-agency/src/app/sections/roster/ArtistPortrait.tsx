"use client";

import { useState } from "react";
import Image, { type StaticImageData } from "next/image";

interface ArtistPortraitProps {
  image?: StaticImageData | string;
  name: string;
  variant?: "card" | "modal";
  sizes?: string;
  priority?: boolean;
  loading?: "eager" | "lazy";
  className?: string;
}

function NoPortrait({
  name,
  variant,
}: {
  name: string;
  variant: "card" | "modal";
}) {
  const isModal = variant === "modal";

  return (
    <div
      role="img"
      aria-label={name}
      className={`absolute inset-0 ${isModal ? "ca-stripe-ph-lg" : "ca-stripe-ph"}`}
    >
      {/* Wordmark — full artist name */}
      <span
        aria-hidden="true"
        className={`absolute inset-0 flex items-center justify-center px-[8%] text-center font-display uppercase leading-[0.9] tracking-[0.01em] text-ca-dim [overflow-wrap:anywhere] ${
          isModal
            ? "text-[clamp(40px,8vw,92px)]"
            : "text-[clamp(22px,4.2vw,42px)]"
        }`}
      >
        {name}
      </span>
    </div>
  );
}

export function ArtistPortrait({
  image,
  name,
  variant = "card",
  sizes,
  priority,
  loading,
  className,
}: ArtistPortraitProps) {
  const [errored, setErrored] = useState(false);

  const showFallback = !image || errored;

  return (
    <div className={`absolute inset-0 ${className ?? ""}`}>
      {showFallback ? (
        <NoPortrait name={name} variant={variant} />
      ) : (
        <Image
          key={typeof image === "string" ? image : image.src}
          src={image}
          alt={name}
          fill
          sizes={sizes}
          priority={priority}
          loading={loading}
          // 정적 import(StaticImageData)만 빌드 타임 blur를 자동 생성한다.
          // 문자열 경로(comingSoon 폴백)는 blurDataURL이 없어 placeholder 생략.
          placeholder={typeof image === "string" ? undefined : "blur"}
          className={`object-cover ${
            variant === "card"
              ? "transform-gpu transition-transform duration-700 ease-out group-hover:scale-[1.06]"
              : ""
          }`}
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
}
