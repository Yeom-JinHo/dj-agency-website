import { ImageResponse } from "next/og";

import { metadata as meta } from "@/app/config";

// Brand-neutral share card, code-generated so no static binary is committed.
// Next serves this at `/opengraph-image.png`, the same path `config.ts`
// declares as `ogImage`, so the file convention and the factory-emitted
// og:image/twitter:image resolve to one identical URL (no duplicate cards).
// No edge runtime: the card prerenders statically at build, matching the
// brand sites' static share images.
export const alt = meta.site.title;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#fafafa",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            fontSize: 96,
            fontWeight: 700,
            letterSpacing: "-0.03em",
          }}
        >
          {meta.site.title}
        </div>
        <div
          style={{
            marginTop: 24,
            fontSize: 36,
            color: "#a1a1aa",
            letterSpacing: "0.01em",
          }}
        >
          {meta.site.description}
        </div>
      </div>
    ),
    size,
  );
}
