import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

// The brand icon is read from disk, so this must run on the Node.js runtime.
export const runtime = "nodejs";
// No request-dependent input — generate once at build time and cache.
export const dynamic = "force-static";

const SIZE = { width: 1200, height: 630 } as const;
// app/icon.png is a 512×512 black-background wordmark — high-contrast and
// crisp. Rendered at its native size (no upscaling) so the card stays sharp.
const LOGO = 512;

export async function GET() {
  let logoSrc: string | null = null;
  try {
    const bytes = await readFile(join(process.cwd(), "src/app/icon.png"));
    logoSrc = `data:image/png;base64,${bytes.toString("base64")}`;
  } catch {
    // Asset moved/renamed — fall back to a brand-text card so the OG image
    // still resolves instead of returning a 500.
    logoSrc = null;
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
          // Pure black matches the icon's baked-in background so the square
          // blends seamlessly into a full-bleed card.
          backgroundColor: "#000000",
        }}
      >
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoSrc}
            alt="Celebrate Agency"
            width={LOGO}
            height={LOGO}
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
