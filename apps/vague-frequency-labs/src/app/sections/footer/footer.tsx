"use client";

import React, { useEffect, useRef, useState } from "react";

import Content from "./content";

export default function Footer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer로 가벼운 스크롤 감지
  useEffect(() => {
    const currentElement = containerRef.current;

    if (!currentElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsVisible(true);
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      },
    );

    observer.observe(currentElement);

    return () => {
      observer.unobserve(currentElement);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-[320px] sm:h-[350px] md:h-[380px] lg:h-[420px] xl:h-[480px] 2xl:h-[540px]"
      style={{
        clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)",
      }}
    >
      <div
        className={[
          "fixed bottom-0 h-[320px] w-full sm:h-[350px] md:h-[380px] lg:h-[420px] xl:h-[480px] 2xl:h-[540px]",
          "transition-opacity duration-700 ease-out",
          isVisible ? "opacity-100" : "opacity-50",
        ].join(" ")}
      >
        <Content />
      </div>
    </div>
  );
}
