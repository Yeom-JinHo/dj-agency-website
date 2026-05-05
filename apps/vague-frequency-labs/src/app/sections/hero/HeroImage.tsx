import type { MotionValue } from "motion/react";
import { useMemo } from "react";
import Image from "next/image";
import { motion, useTransform } from "motion/react";

function HeroImage({
  scrollYProgress,
  i,
  src,
}: {
  scrollYProgress: MotionValue<number>;
  i: number;
  src: string;
}) {
  // useMemo로 계산 최적화
  const transformConfig = useMemo(() => {
    const inputStart = 0;
    const inputEnd = 0.75;

    return {
      inputStart,
      inputEnd,
      xEnd: `${i * 28 - 40}vw`,
      zIndex: 999 - i,
    };
  }, [i]);

  const x = useTransform(
    scrollYProgress,
    [transformConfig.inputStart, transformConfig.inputEnd],
    ["0vw", transformConfig.xEnd],
  );

  const y = useTransform(
    scrollYProgress,
    [transformConfig.inputStart, transformConfig.inputEnd],
    [0, 0],
  );

  const scale = useTransform(
    scrollYProgress,
    [transformConfig.inputStart, transformConfig.inputEnd],
    [1, 0.25],
  );

  return (
    <motion.div
      key={i}
      className={`absolute top-1/2 left-1/2 h-[60vh] w-screen rounded object-cover shadow-xl md:h-screen`}
      style={{
        x,
        scale,
        y,
        zIndex: transformConfig.zIndex,
        translateX: "-50%",
        translateY: "-50%",
      }}
    >
      <Image src={src} alt="hero" className="aspect-[4/3] object-cover" fill sizes="100vw" priority />
    </motion.div>
  );
}

export default HeroImage;
