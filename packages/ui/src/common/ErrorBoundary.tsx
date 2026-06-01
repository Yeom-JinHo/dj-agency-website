"use client";

import type { ReactNode } from "react";
import { Component } from "react";
import { motion } from "motion/react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    // 웹뷰에서 발생하는 에러를 안전하게 로깅
    console.error("Error caught by boundary:", error, errorInfo);
  }

  handleReload = () => {
    try {
      // SSR/프리렌더링 환경에서 window 객체 접근을 안전하게 처리
      if (typeof window !== "undefined" && window.location) {
        window.location.reload();
      } else {
        // window가 사용 불가능한 경우 fallback 처리
        console.warn("Window not available, cannot reload page");
        // 상태를 리셋하여 에러 상태에서 벗어나도록 함
        this.setState({ hasError: false });
      }
    } catch (error) {
      console.warn("Page reload failed:", error);
      // 에러 발생 시 상태만 리셋
      this.setState({ hasError: false });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] px-6 text-center">
            {/* Scan-line accent — top */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-0 left-0 right-0 h-px bg-red-500/60"
            />

            {/* Watermark: giant background "ERROR" typography */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden"
            >
              <span
                className="font-display text-[18vw] font-bold uppercase leading-none tracking-[-0.04em] text-white/[0.028] sm:text-[22vw]"
                style={{ whiteSpace: "nowrap" }}
              >
                ERROR
              </span>
            </div>

            {/* Radial vignette — adds depth around the watermark */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse 80% 50% at 50% 50%, transparent 0%, #0a0a0a 75%)",
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center">
              {/* Meta label cluster */}
              <motion.div
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="font-mono text-[13px] uppercase tracking-[0.3em] text-red-500/80 sm:text-sm">
                  System Error
                </p>
                <h1 className="font-display text-[clamp(44px,9vw,96px)] uppercase leading-[0.92] tracking-[-0.02em] text-white">
                  Something
                  <br />
                  went wrong
                </h1>
              </motion.div>

              {/* Body + actions cluster */}
              <motion.div
                className="mt-6 flex flex-col items-center gap-6 sm:mt-10 sm:gap-8"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.13,
                }}
              >
                <p className="max-w-[340px] font-sans text-[15px] leading-relaxed text-white/50 sm:text-base">
                  Please refresh the page or return home.
                </p>

                <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
                  <button
                    type="button"
                    onClick={this.handleReload}
                    className="min-w-[150px] rounded-none border border-white/30 bg-transparent px-8 py-3.5 font-mono text-[13px] uppercase tracking-[0.22em] text-white transition-all duration-200 hover:border-white hover:bg-white hover:text-[#0a0a0a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
                  >
                    Refresh
                  </button>
                  <a
                    href="/"
                    className="min-h-[44px] inline-flex items-center font-mono text-[13px] uppercase tracking-[0.22em] text-white/40 transition-colors hover:text-white/80"
                  >
                    ← Home
                  </a>
                </div>
              </motion.div>

              {/* Bottom meta: error code */}
              <motion.p
                className="mt-8 font-mono text-[11px] uppercase tracking-[0.25em] text-white/20 sm:mt-16"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                aria-hidden
              >
                ERR_RUNTIME_EXCEPTION
              </motion.p>
            </div>

            {/* Scan-line accent — bottom */}
            <div
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-white/10"
            />
          </div>
        )
      );
    }

    return this.props.children;
  }
}
