"use client";

import { useEffect, useState } from "react";
import NumberTicker from "@repo/ui/common/NumberTicker";
import TextReveal from "@repo/ui/common/TextReveal";
import { Preloader } from "@repo/ui/common/Preloader";
import { AnimatePresence } from "motion/react";
import { cn } from "@repo/ui";

// NumberTicker counts for 2s, then "Are you ready?" shows for 1s before lift.
const READY_AT = 2000;
const DISMISS_AT = 3000;

export default function Loader() {
  const [isVisible, setIsVisible] = useState(true);
  const [isReady, setIsReady] = useState(false);

  // Drive the loader timeline on wall-clock, NOT the NumberTicker's
  // rAF-based onComplete. Background tabs freeze rAF, so a load that's tabbed
  // away mid-count would otherwise leave the loader stuck (and the hero behind
  // it) until the user returns. setTimeout still fires in the background, and
  // visibilitychange catches up the moment the tab is shown again.
  useEffect(() => {
    const start = Date.now();
    let dismissed = false;
    const advance = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= READY_AT) setIsReady(true);
      if (elapsed >= DISMISS_AT && !dismissed) {
        dismissed = true;
        setIsVisible(false);
      }
    };
    const t1 = setTimeout(advance, READY_AT);
    const t2 = setTimeout(advance, DISMISS_AT);
    const onVisible = () => {
      if (!document.hidden) advance();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <Preloader>
          {!isReady ? (
            <NumberTicker
              className="font-display"
              from={0}
              target={100}
              autoStart={true}
              transition={{ duration: 2, type: "tween", ease: "easeInOut" }}
            />
          ) : (
            <>
              <TextReveal className={cn("text-6xl font-bold xl:text-[12rem]", "font-display")}>
                Are
              </TextReveal>
              <TextReveal className={cn("ml-2 text-6xl font-bold xl:ml-10 xl:text-[12rem]", "font-display")}>
                you
              </TextReveal>
              <TextReveal className={cn("ml-2 text-6xl font-bold xl:ml-10 xl:text-[12rem]", "font-display")}>
                ready?
              </TextReveal>
            </>
          )}
        </Preloader>
      )}
    </AnimatePresence>
  );
}
