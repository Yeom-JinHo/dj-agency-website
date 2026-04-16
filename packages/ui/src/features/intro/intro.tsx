"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { COMPANY_NAME, type AppId } from "@repo/utils/company";
import { useMobile } from "../../hooks/useMobile";
import { HighlightText } from "./highlight-text";
import vflLogo from "../../assets/logos/vfl.png";
import caLogo from "../../assets/logos/ca.png";
import prLogo from "../../assets/logos/pr.png";

interface IntroProps {
  currentApp: AppId;
  appUrls: Record<AppId, string>;
}

export function Intro({ currentApp, appUrls }: IntroProps) {
  const isMobile = useMobile();
  const [hoveredText, setHoveredText] = useState("");

  const entries: Array<{
    id: AppId;
    label: string;
    image: typeof vflLogo;
  }> = [
    { id: "VFL", label: COMPANY_NAME.VAGUE_FREQUENCY_LABS, image: vflLogo },
    { id: "CA", label: COMPANY_NAME.CELEBRATE_AGENCY, image: caLogo },
    { id: "PR", label: COMPANY_NAME.PAYDAY_RECORDS, image: prLogo },
  ];

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
            key={hoveredText}
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
            {hoveredText || "?"}
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
    </section>
  );
}
