"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * 진입 인트로: 솔리드 필드 위에 메탈 "P" 실루엣이 등장 → 다이브가 시작되면
 * 필드가 사라지며 P의 보울(구멍) 너머로 뒤의 Hero가 드러난다 → P는 보울 중심을
 * 기준으로 거대하게 확대되어 실루엣이 화면 밖으로 날아가고 Hero만 남는다.
 *
 * 실루엣은 알파 PNG를 CSS 마스크로 입혀 테마색(bg-foreground)으로 렌더한다.
 * 마스크 투명 영역(보울 + 실루엣 바깥)으로 뒤의 Hero가 비친다.
 * 매 진입마다 1회 재생한다.
 */

// 메탈 P 실루엣 마스크 (배경/보울 알파 투명). 비율 1600x1327.
const MASK_SRC = "/images/intro/metal-p.png";
const MASK_RATIO = "1600 / 1327";

// 실루엣 박스 기준 보울(구멍) 중심 — 카메라가 빨려드는 지점.
const COUNTER_ORIGIN = "54% 36%";

// 전체 연출 길이(초).
const DURATION = 2;

function IntroDive() {
  const [done, setDone] = useState(false);

  if (done) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[1000] flex items-center justify-center overflow-hidden"
        aria-hidden
      >
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
          style={{
            width: "min(66vmin, 92vw)",
            aspectRatio: MASK_RATIO,
            transformOrigin: COUNTER_ORIGIN,
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
    </AnimatePresence>
  );
}

export default IntroDive;
