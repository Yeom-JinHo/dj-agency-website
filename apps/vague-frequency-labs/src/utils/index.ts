import type { Metadata } from "next";
import { createMetadataFactory } from "@repo/utils/metadata";
import { metadata as meta } from "@/app/config";

export const baseUrl = meta.site.url;

const factory = createMetadataFactory(meta);

// Next.js serves the `app/opengraph-image.png` file convention at this stable
// route (verified 200 + image/page). Keep in sync with the alt text file.
const OG_IMAGE_PATH = "/opengraph-image.png";
const OG_IMAGE_ALT = "Vague Frequency Laboratory";

const ogImage = {
  alt: OG_IMAGE_ALT,
  width: 1200,
  height: 630,
  url: OG_IMAGE_PATH,
  type: "image/png",
} as const;

/**
 * Wraps the shared metadata factory.
 *
 * The factory injects a default `openGraph.images`/`twitter.images` pointing at
 * `/og`, which 404s for this app. Because a page-level `openGraph`/`twitter`
 * object completely overwrites the root layout's metadata (Next.js shallow-merge
 * semantics), the `app/opengraph-image.png` file convention alone is suppressed
 * on every page that exports its own `openGraph`. So when the caller does not
 * supply its own images, we point the images at the convention file's stable
 * served route (`/opengraph-image.png`). Callers that provide their own images
 * (e.g. artist pages) are left untouched.
 */
export const createMetadata = (override: Metadata): Metadata => {
  const result = factory(override);

  if (!override.openGraph?.images && result.openGraph) {
    (result.openGraph as { images?: unknown }).images = [ogImage];
  }
  if (!override.twitter?.images && result.twitter) {
    (result.twitter as { images?: unknown }).images = [ogImage];
  }

  return result;
};
