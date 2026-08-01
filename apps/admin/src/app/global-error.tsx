"use client";

import { useEffect } from "react";

/**
 * 루트 레이아웃까지 무너졌을 때의 마지막 방어선. 이 컴포넌트는 루트 레이아웃을
 * 대체해 렌더되므로 globals.css가 없다 — Tailwind 클래스 대신 인라인 스타일만 쓴다.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[admin] global error:", error);
  }, [error]);

  return (
    <html lang="ko">
      <body
        style={{
          display: "flex",
          minHeight: "100svh",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>
            문제가 발생했습니다
          </h1>
          <p style={{ fontSize: 14, color: "#737373", marginBottom: 16 }}>
            일시적인 오류일 수 있습니다. 다시 시도해주세요.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              border: "1px solid #d4d4d4",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 14,
              background: "transparent",
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </div>
      </body>
    </html>
  );
}
