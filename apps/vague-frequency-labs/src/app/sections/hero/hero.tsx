"use client";

import { motion, useReducedMotion } from "motion/react";
import Globe from "@/components/Globe";

const EASE = [0.22, 1, 0.36, 1] as const;

function Hero() {
  const reduce = useReducedMotion();

  // 로더가 hero를 fixed로 덮은 채 약 3초간 떠 있으므로, 진입 모션이
  // 로더 뒤에서 소모되지 않도록 로더 종료 즈음에 시작하도록 delay를 준다.
  const rise = (delay: number) =>
    reduce
      ? { initial: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 24 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, delay, ease: EASE },
        };

  return (
    <section className="relative h-[100svh] overflow-x-hidden pt-16">
      <div className="flex h-full flex-col items-center justify-center gap-2 pb-4 sm:gap-4 md:gap-6">
        <motion.p
          {...rise(2.6)}
          className="font-display w-full text-center text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl"
        >
          We are
        </motion.p>
        <Globe className="h-[min(85vw,calc(100svh-10rem))] w-[min(85vw,calc(100svh-10rem))] md:h-[min(70vw,calc(100svh-14rem))] md:w-[min(70vw,calc(100svh-14rem))] lg:h-[min(55vw,calc(100svh-16rem))] lg:w-[min(55vw,calc(100svh-16rem))] 2xl:h-[min(50vw,calc(100svh-18rem))] 2xl:w-[min(50vw,calc(100svh-18rem))]" />
        <motion.h1
          {...rise(2.8)}
          className="w-full text-center text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl"
        >
          Vague Frequency Labs
        </motion.h1>
      </div>

      <motion.div
        aria-hidden
        initial={reduce ? { opacity: 1 } : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={reduce ? undefined : { duration: 0.6, delay: 3.3 }}
        className="text-foreground/50 pointer-events-none absolute inset-x-0 bottom-6 flex justify-center"
      >
        <motion.svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6"
          animate={reduce ? undefined : { y: [0, 8, 0] }}
          transition={
            reduce
              ? undefined
              : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
          }
        >
          <path d="m6 9 6 6 6-6" />
        </motion.svg>
      </motion.div>
    </section>
  );
}

export default Hero;
