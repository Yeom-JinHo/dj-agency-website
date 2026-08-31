"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import Image, { type StaticImageData } from "next/image";
import { motion } from "motion/react";

interface HighlightTextProps {
  children: string;
  label: string;
  isSelf: boolean;
  targetUrl: string;
  isHover: boolean;
  imageSrc: StaticImageData;
  isMobile: boolean;
  onHover: (text: string) => void;
  /** 자기 앱 클릭 시 이동할 홈 경로 (locale prefix 앱용). */
  homeHref: string;
}


export function HighlightText({
  children,
  label,
  isSelf,
  targetUrl,
  isHover,
  imageSrc,
  isMobile,
  onHover,
  homeHref,
}: HighlightTextProps) {
  const router = useRouter();
  const pendingRef = useRef(false);

  const handleMouseEnter = () => {
    if (pendingRef.current) return;
    onHover(label);
  };
  const handleMouseLeave = () => {
    if (pendingRef.current) return;
    onHover("");
  };
  const handleClick = () => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    onHover(label);
    if (isSelf) {
      router.push(homeHref);
    } else {
      window.location.href = targetUrl;
    }
  };

  return (
    <div
      className={
        isMobile
          ? "relative flex h-full w-screen items-center justify-center"
          : "relative flex h-screen w-full items-center justify-center"
      }
      onTouchStart={handleMouseEnter}
      onTouchEnd={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
    >
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHover ? 0.6 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          src={imageSrc}
          alt={`${label} logo`}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          style={{ objectFit: "contain" }}
        />
      </motion.div>

      <button
        className="relative overflow-hidden font-sans text-2xl font-bold text-transparent uppercase"
        style={{ WebkitTextStroke: "1px white" }}
        type="button"
      >
        <span className="actual-text">{children}</span>

        <motion.span
          className="align-center pointer-events-none absolute inset-0 whitespace-nowrap"
          initial={{ width: 0 }}
          animate={{ width: isHover ? "100%" : "0%" }}
          transition={{ duration: 0.5 }}
          style={{
            color: "white",
            WebkitTextStroke: "1px white",
            borderRight: isHover ? "6px solid white" : "0px solid transparent",
            overflow: "hidden",
            filter: isHover ? "drop-shadow(0 0 3px white)" : "none",
          }}
        >
          {children}
        </motion.span>
      </button>
    </div>
  );
}
