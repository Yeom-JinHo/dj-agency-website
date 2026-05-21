"use client";

import { useState } from "react";
import { motion } from "motion/react";

/**
 * 진입 인트로: 솔리드 필드 위에 "P" 실루엣이 등장 → 다이브가 시작되면
 * 필드가 사라지며 P의 보울(구멍) 너머로 뒤의 Hero가 드러난다 → P는 보울 중심을
 * 기준으로 거대하게 확대되어 실루엣이 화면 밖으로 날아가고 Hero만 남는다.
 *
 * 실루엣은 알파 PNG를 CSS 마스크로 입혀 테마색(bg-foreground)으로 렌더한다.
 * 마스크 투명 영역(보울 + 실루엣 바깥)으로 뒤의 Hero가 비친다.
 * 매 진입마다 1회 재생한다.
 */

// P 실루엣 마스크 (배경/보울 알파 투명). 비율 1600x1333.
const MASK_SRC = "/images/intro/metal-p.png";
const MASK_RATIO = "1600 / 1333";

// 실루엣 박스 기준 보울(구멍) 중심 — 카메라가 빨려드는 지점.
const COUNTER_ORIGIN = "55% 36%";

// 전체 연출 길이(초).
const DURATION = 2.8;

// 실루엣 확대 배율 — 다이브 느낌은 주되 격하게 날아가지 않을 정도.
const MAX_SCALE = 22;

function IntroDive() {
  const [done, setDone] = useState(false);

  if (done) return null;

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
        style={{ willChange: "opacity" }}
        initial={{ opacity: 1 }}
        animate={{ opacity: [1, 1, 0, 0] }}
        transition={{ duration: DURATION, times: [0, 0.32, 0.62, 1], ease: "easeInOut" }}
      />

      {/* P 실루엣: 보울 중심으로 거대하게 확대 → 구멍 너머 Hero가 드러난다. */}
      <motion.div
        className="bg-foreground relative"
        style={{
          width: "min(66vmin, 92vw, 80vh)",
          aspectRatio: MASK_RATIO,
          transformOrigin: COUNTER_ORIGIN,
          willChange: "transform, opacity, filter",
          WebkitMaskImage: `url(${MASK_SRC})`,
          maskImage: `url(${MASK_SRC})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "center",
          maskPosition: "center",
        }}
        initial={{ scale: 1, opacity: 0, filter: "blur(14px)" }}
        animate={{
          scale: [1, 1.05, MAX_SCALE],
          opacity: [0, 1, 1, 0],
          filter: ["blur(14px)", "blur(0px)", "blur(0px)", "blur(10px)"],
        }}
        transition={{
          duration: DURATION,
          scale: { times: [0, 0.22, 1], ease: ["easeOut", "easeIn"] },
          // 다이브 막바지에 페이드아웃 + 살짝 블러로 Hero에 부드럽게 녹아든다.
          opacity: { times: [0, 0.22, 0.7, 1], ease: "easeInOut" },
          filter: { times: [0, 0.22, 0.7, 1], ease: "easeIn" },
        }}
        onAnimationComplete={() => setDone(true)}
      />
    </div>
  );
}

export default IntroDive;
