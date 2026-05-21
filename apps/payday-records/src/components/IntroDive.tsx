"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/**
 * 진입 인트로: 솔리드 필드 위에 단독 "P"가 등장 → 다이브가 시작되면 필드가
 * 사라지며 P의 counter(구멍) 너머로 뒤의 Hero가 드러난다 → P는 counter 중심을
 * 기준으로 거대하게 확대되어 잉크가 화면 밖으로 날아가고 Hero만 남는다.
 *
 * 필드(bg-background)와 P를 별도 레이어로 두어, 필드만 페이드아웃하고 P 잉크는
 * 계속 확대되게 한다. 매 진입마다 1회 재생한다.
 */

// 인트로 주인공 글리프. 산세리프 대문자 P.
const GLYPH = "P";

// 글리프 박스 기준 counter(구멍) 중심 좌표 — 카메라가 빨려드는 지점.
// 폰트 글리프 metrics에 맞춘 튜닝값.
const COUNTER_ORIGIN = "53% 36%";

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
            사라지며 뒤의 Hero를 구멍 너머로 드러낸다. */}
        <motion.div
          className="bg-background absolute inset-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: [1, 1, 0, 0] }}
          transition={{ duration: DURATION, times: [0, 0.32, 0.62, 1], ease: "easeInOut" }}
        />

        {/* P: counter 중심으로 거대하게 확대 → 구멍 너머 Hero가 드러난다. */}
        <motion.span
          className="text-foreground relative block leading-none font-bold select-none"
          style={{ fontSize: "44vmin", transformOrigin: COUNTER_ORIGIN }}
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
        >
          {GLYPH}
        </motion.span>
      </div>
    </AnimatePresence>
  );
}

export default IntroDive;
