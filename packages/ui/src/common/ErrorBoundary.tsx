"use client";

import type { ReactNode } from "react";
import { Component } from "react";

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
          <div className="relative flex min-h-[100dvh] flex-col items-center justify-center gap-6 overflow-hidden bg-[#0a0a0a] px-6 text-center">
            <p className="font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
              Error
            </p>
            <h1 className="font-mono text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Something went wrong
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-white/55">
              Please refresh the page or try again later.
            </p>
            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={this.handleReload}
                className="rounded-full border border-white/25 bg-white/10 px-7 py-2.5 font-mono text-[11px] tracking-[0.18em] text-white uppercase backdrop-blur-sm transition-colors hover:bg-white/20"
              >
                Refresh
              </button>
              <a
                href="/"
                className="font-mono text-[11px] tracking-[0.18em] text-white/45 uppercase underline-offset-4 transition-colors hover:text-white/80 hover:underline"
              >
                Home
              </a>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
