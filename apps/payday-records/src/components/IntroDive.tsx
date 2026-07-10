"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { useReducedMotionSafe } from "@repo/ui/hooks/useReducedMotionSafe";

/**
 * 진입 인트로: 솔리드 필드 위에 메탈 "P" 실루엣이 등장 → 다이브가 시작되면
 * 필드가 사라지며 P의 보울(구멍) 너머로 뒤의 Hero가 드러난다 → P는 보울 중심을
 * 기준으로 거대하게 확대되어 실루엣이 화면 밖으로 날아가고 Hero만 남는다.
 *
 * 실루엣은 알파 webp를 CSS 마스크로 입혀 테마색(bg-foreground)으로 렌더한다.
 * 마스크 투명 영역(보울 + 실루엣 바깥)으로 뒤의 Hero가 비친다.
 * 매 진입마다 1회 재생한다.
 *
 * NOTE: 큰 scale(64)은 보울이 뷰포트를 가득 채워 "구멍을 통과"하는 착시의 핵심이다.
 * 성능 이유로 낮추지 말 것 — 낮추면 "통과"가 "증발"로 바뀌어 어색해진다.
 */

// 메탈 P 실루엣 마스크 (배경/보울 알파 투명). 비율 1600x1333.
const MASK_SRC = "/images/intro/metal-p.webp";
const MASK_RATIO = "1600 / 1333";

// 실루엣 박스 기준 보울(구멍) 중심 — 카메라가 빨려드는 지점.
const COUNTER_ORIGIN = "55% 36%";

// 전체 연출 길이(초).
const DURATION = 2;

// 실루엣 공통 스타일 — 일반/reduced 렌더가 같은 마스크를 공유한다.
const silhouetteStyle = {
  width: "min(66vmin, 92vw)",
  aspectRatio: MASK_RATIO,
  WebkitMaskImage: `url(${MASK_SRC})`,
  maskImage: `url(${MASK_SRC})`,
  WebkitMaskSize: "contain",
  maskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: "center",
  maskPosition: "center",
} as const;

function IntroDive() {
  const [done, setDone] = useState(false);
  const reduceMotion = useReducedMotionSafe();

  if (done) return null;

  // prefers-reduced-motion: 다이브(확대) 없이 정적인 P를 잠깐 보여주고
  // 오버레이 전체를 짧게 페이드아웃 — 모션 대체로 권장되는 fade만 사용.
  if (reduceMotion) {
    return (
      <motion.div
        className="bg-background fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden"
        aria-hidden
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.5, delay: 0.6, ease: "easeInOut" }}
        onAnimationComplete={() => setDone(true)}
      >
        <link rel="preload" as="image" href={MASK_SRC} />
        <div className="bg-foreground relative" style={silhouetteStyle} />
      </motion.div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden"
      aria-hidden
    >
      {/* 마스크 PNG 프리로드 — 등장 시 흰 사각형 FOUC 방지. */}
      <link rel="preload" as="image" href={MASK_SRC} />

      {/* 솔리드 필드: 깨끗한 "P" 인트로를 만들었다가 다이브 시작 시
          사라지며 뒤의 Hero를 보울 너머로 드러낸다. */}
      <motion.div
        className="bg-background absolute inset-0"
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: DURATION, times: [0, 0.32, 0.62, 1], ease: "easeInOut" }}
      />

      {/* 메탈 P 실루엣: 보울 중심으로 거대하게 확대 → 구멍 너머 Hero가 드러난다. */}
      <motion.div
        className="bg-foreground relative"
        style={{ ...silhouetteStyle, transformOrigin: COUNTER_ORIGIN }}
        initial={{ scale: 1, opacity: 0, filter: "blur(14px)" }}
        animate={{
          scale: [1, 1.05, 64],
          opacity: [0, 1, 1],
          filter: ["blur(14px)", "blur(0px)", "blur(0px)"],
        }}
        transition={{
          duration: DURATION,
          times: [0, 0.22, 1],
          ease: ["easeOut", "easeIn"],
        }}
        onAnimationComplete={() => setDone(true)}
      />
    </div>
  );
}

export default IntroDive;
