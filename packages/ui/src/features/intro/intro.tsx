"use client";

import { useState } from "react";
import { preconnect } from "react-dom";
import { motion } from "motion/react";
import { COMPANY_NAME, type AppId } from "@repo/utils/company";
import { useMobile } from "../../hooks/useMobile";
import { HighlightText } from "./highlight-text";
import vflLogo from "../../assets/logos/vfl.png";
import caLogo from "../../assets/logos/ca.png";
import prLogo from "../../assets/logos/pr.png";

interface IntroProps {
  /**
   * 현재 앱이 세 브랜드 중 하나일 때 그 id. 브랜드 중립 포털(별도 도메인)처럼
   * 세 항목을 모두 외부로 보내야 하는 경우 생략한다 — 어느 entry와도 매칭되지
   * 않아 isSelf가 항상 false가 되고, 클릭 시 전부 외부 URL로 이동한다.
   */
  currentApp?: AppId;
  appUrls: Record<AppId, string>;
  /** not-found 컨텍스트에서만 노출되는 절제된 한 줄 힌트. 정상 /intro에서는 넘기지 않는다. */
  notice?: string;
}

export function Intro({ currentApp, appUrls, notice }: IntroProps) {
  const isMobile = useMobile();
  const [hoveredText, setHoveredText] = useState("");

  const entries: Array<{
    id: AppId;
    label: string;
    image: typeof vflLogo;
  }> = [
    {
      id: "vague-frequency-labs",
      label: COMPANY_NAME.VAGUE_FREQUENCY_LABS,
      image: vflLogo,
    },
    {
      id: "celebrate-agency",
      label: COMPANY_NAME.CELEBRATE_AGENCY,
      image: caLogo,
    },
    {
      id: "payday-records",
      label: COMPANY_NAME.PAYDAY_RECORDS,
      image: prLogo,
    },
  ];

  // 외부 브랜드 origin을 마운트 시점에 미리 연결(DNS+TCP+TLS)해, 클릭 후
  // cross-origin 풀 내비게이션의 콜드 핸드셰이크 지연을 제거한다. self(같은
  // origin)는 제외. React가 동일 origin preconnect를 dedupe한다.
  for (const entry of entries) {
    if (entry.id === currentApp) continue;
    try {
      preconnect(new URL(appUrls[entry.id]).origin);
    } catch {
      // 잘못된 URL(env var 누락 등)은 조용히 건너뛴다.
    }
  }

  return (
    <section
      className={
        isMobile
          ? "relative flex h-screen w-full flex-col overflow-hidden"
          : "relative flex h-full w-screen overflow-hidden"
      }
    >
      {!isMobile && (
        <div className="fixed top-8 left-1/2 z-50 -translate-x-1/2 text-2xl font-bold text-white">
          <span>We&apos;re </span>
          <motion.span
            className="inline-block text-white"
            key={hoveredText || "__caret__"}
            initial={{ opacity: 0, y: -40, rotateX: -90 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: 40, rotateX: 90 }}
            transition={{
              duration: 0.5,
              ease: "easeInOut",
              type: "spring",
              stiffness: 100,
              damping: 15,
            }}
          >
            {hoveredText ? (
              hoveredText
            ) : (
              <motion.span
                aria-hidden="true"
                className="inline-block tracking-[0.05em]"
                animate={{ opacity: [1, 0, 1] }}
                transition={{
                  duration: 1.1,
                  repeat: Infinity,
                  ease: [0.4, 0, 0.6, 1],
                }}
              >
                _____
              </motion.span>
            )}
          </motion.span>
        </div>
      )}

      {entries.map((entry) => (
        <HighlightText
          key={entry.id}
          label={entry.label}
          isSelf={entry.id === currentApp}
          targetUrl={appUrls[entry.id]}
          isHover={hoveredText === entry.label}
          imageSrc={entry.image}
          isMobile={isMobile}
          onHover={setHoveredText}
        >
          {entry.label}
        </HighlightText>
      ))}

      {notice && !isMobile && (
        <motion.p
          aria-hidden="true"
          className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 text-center text-xs tracking-[0.25em] text-white/45 uppercase"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.3 }}
        >
          {notice}
        </motion.p>
      )}
    </section>
  );
}
