import { ImageResponse } from "next/og";

// Brand-neutral favicon, code-generated so no static binary is committed.
// A simple neutral monogram on a dark ground — Next serves it as the app icon.
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          fontSize: 22,
          fontWeight: 700,
          fontFamily: "sans-serif",
          borderRadius: 6,
        }}
      >
        I
      </div>
    ),
    size,
  );
}
