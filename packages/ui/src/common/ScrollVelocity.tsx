"use client";

import type { CSSProperties, FC, ReactNode, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";

interface VelocityMapping {
  input: [number, number];
  output: [number, number];
}

interface VelocityTextProps {
  children: ReactNode;
  baseVelocity: number;
  scrollContainerRef?: RefObject<HTMLElement | null>;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
  velocityMapping?: VelocityMapping;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: CSSProperties;
  scrollerStyle?: CSSProperties;
}

interface ScrollVelocityProps {
  scrollContainerRef?: RefObject<HTMLElement | null>;
  texts: string[];
  velocity?: number;
  className?: string;
  damping?: number;
  stiffness?: number;
  numCopies?: number;
  velocityMapping?: VelocityMapping;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: CSSProperties;
  scrollerStyle?: CSSProperties;
}

function cn(...values: Array<string | undefined | false | null>) {
  return values.filter(Boolean).join(" ");
}

function useElementWidth<T extends HTMLElement>(
  ref: RefObject<T | null>,
): number {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const update = () => setWidth(element.offsetWidth);
    update();

    const observer = new ResizeObserver(update);
    observer.observe(element);
    window.addEventListener("resize", update);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [ref]);

  return width;
}

function wrap(min: number, max: number, v: number): number {
  const range = max - min;
  const mod = (((v - min) % range) + range) % range;
  return mod + min;
}

function VelocityText({
  children,
  baseVelocity,
  scrollContainerRef,
  className,
  damping,
  stiffness,
  numCopies,
  velocityMapping,
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle,
}: VelocityTextProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll(
    scrollContainerRef ? { container: scrollContainerRef } : {},
  );
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: damping ?? 50,
    stiffness: stiffness ?? 400,
  });
  const velocityFactor = useTransform(
    smoothVelocity,
    velocityMapping?.input ?? [0, 1000],
    velocityMapping?.output ?? [0, 5],
    { clamp: false },
  );

  const copyRef = useRef<HTMLSpanElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const copyWidth = useElementWidth(copyRef);
  const parallaxWidth = useElementWidth(parallaxRef);

  const x = useTransform(baseX, (v) => {
    if (copyWidth === 0) return "0px";
    return `${wrap(-copyWidth, 0, v)}px`;
  });

  const directionFactor = useRef<number>(1);
  useAnimationFrame((_, delta) => {
    const factor = velocityFactor.get();
    if (factor < 0) {
      directionFactor.current = -1;
    } else if (factor > 0) {
      directionFactor.current = 1;
    }

    const baseMove = directionFactor.current * baseVelocity * (delta / 1000);
    const moveBy = baseMove + directionFactor.current * baseMove * factor;
    baseX.set(baseX.get() + moveBy);
  });

  const requestedCopies = numCopies ?? 6;
  const neededCopies =
    copyWidth > 0 ? Math.ceil(parallaxWidth / copyWidth) + 2 : requestedCopies;
  const copies = Math.max(requestedCopies, neededCopies);
  const spans = [];
  for (let i = 0; i < copies; i++) {
    spans.push(
      <span
        className={cn("flex-shrink-0", className)}
        key={i}
        ref={i === 0 ? copyRef : null}
      >
        {children}
      </span>,
    );
  }

  return (
    <div
      ref={parallaxRef}
      className={cn(parallaxClassName, "relative overflow-hidden")}
      style={parallaxStyle}
    >
      <motion.div
        className={cn(
          scrollerClassName,
          "flex text-center font-sans text-4xl font-bold tracking-[-0.02em] whitespace-nowrap drop-shadow md:text-[5rem] md:leading-[5rem]",
        )}
        style={{ x, ...scrollerStyle }}
      >
        {spans}
      </motion.div>
    </div>
  );
}

export const ScrollVelocity: FC<ScrollVelocityProps> = ({
  scrollContainerRef,
  texts = [],
  velocity = 100,
  className = "",
  damping = 50,
  stiffness = 400,
  numCopies = 6,
  velocityMapping = { input: [0, 1000], output: [0, 5] },
  parallaxClassName,
  scrollerClassName,
  parallaxStyle,
  scrollerStyle,
}) => {
  return (
    <section>
      {texts.map((text: string, index: number) => (
        <VelocityText
          key={index}
          className={className}
          baseVelocity={index % 2 !== 0 ? -velocity : velocity}
          scrollContainerRef={scrollContainerRef}
          damping={damping}
          stiffness={stiffness}
          numCopies={numCopies}
          velocityMapping={velocityMapping}
          parallaxClassName={parallaxClassName}
          scrollerClassName={scrollerClassName}
          parallaxStyle={parallaxStyle}
          scrollerStyle={scrollerStyle}
        >
          {text}&nbsp;
        </VelocityText>
      ))}
    </section>
  );
};

export default ScrollVelocity;
