"use client";

import { useEffect, useRef, useState } from "react";
import NumberTicker from "@repo/ui/common/NumberTicker";
import TextReveal from "@repo/ui/common/TextReveal";
import { Preloader } from "@repo/ui/common/Preloader";
import { AnimatePresence } from "motion/react";
import { Teko } from 'next/font/google';
import { cn } from "@repo/ui";

const teko = Teko({ weight: "400", subsets: ["latin"] });

export default function Loader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 이전 timer가 있다면 항상 정리
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // isReady가 true일 때만 새로운 timer 설정
    if (isReady) {
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, 400);
    }

    // cleanup 함수 - 컴포넌트 언마운트 시에도 실행됨
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isReady]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <Preloader>
          {!isReady ? (
            <NumberTicker
              className={cn(teko.className)}
              from={10}
              target={100}
              autoStart={true}
              transition={{ duration: 1.2, type: "tween", ease: "easeInOut" }}
              onComplete={() => setIsReady(true)}
            />
          ) : (
            <>
              <TextReveal className={cn("text-6xl font-bold xl:text-[12rem]", teko.className)}>
                Are
              </TextReveal>
              <TextReveal className={cn("ml-2 text-6xl font-bold xl:ml-10 xl:text-[12rem]", teko.className)}>
                you
              </TextReveal>
              <TextReveal className={cn("ml-2 text-6xl font-bold xl:ml-10 xl:text-[12rem]", teko.className)}>
                ready?
              </TextReveal>
            </>
          )}
        </Preloader>
      )}
    </AnimatePresence>
  );
}
