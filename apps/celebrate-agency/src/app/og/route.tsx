import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Reads a file from disk, so this must run on the Node.js runtime.
export const runtime = "nodejs";
// Static asset with no request-dependent input — bake at build time.
export const dynamic = "force-static";

// The shared metadata factory points og:image / twitter:image at "/og", so we
// serve the pre-built 1200×630 card here (composed from the hero wordmark).
export async function GET() {
  const png = await readFile(
    join(process.cwd(), "public/opengraph-image.png"),
  );

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
