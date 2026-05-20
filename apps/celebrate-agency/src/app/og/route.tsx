import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

// hero.png is read from disk, so this must run on the Node.js runtime.
export const runtime = "nodejs";
// No request-dependent input — generate once at build time and cache.
export const dynamic = "force-static";

const SIZE = { width: 1200, height: 630 } as const;
const PADDING = 96;

export async function GET() {
  let heroSrc: string | null = null;
  try {
    const heroBytes = await readFile(
      join(process.cwd(), "public/images/logo/hero.png"),
    );
    heroSrc = `data:image/png;base64,${heroBytes.toString("base64")}`;
  } catch {
    // Asset moved/renamed — fall back to a brand-text card so the OG image
    // still resolves instead of returning a 500.
    heroSrc = null;
  }

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          padding: PADDING,
        }}
      >
        {heroSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroSrc}
            alt="Celebrate Agency"
            width={SIZE.width - PADDING * 2}
            height={SIZE.height - PADDING * 2}
            style={{ objectFit: "contain" }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              color: "#ffffff",
              fontSize: 96,
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            Celebrate Agency
          </div>
        )}
      </div>
    ),
    { ...SIZE },
  );
}
