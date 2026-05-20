import type { MetadataRoute } from "next";

import { metadata as meta } from "@/app/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: meta.site.title,
    short_name: meta.site.title,
    description: meta.site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0a",
    theme_color: "#0a0a0a",
    // apple-icon is consumed via <link rel="apple-touch-icon"> (auto-emitted
    // by the app/apple-icon.png convention), not the webmanifest. The 512×512
    // icon satisfies PWA installability.
    icons: [
      {
        src: "/icon.png",
        type: "image/png",
        sizes: "512x512",
        purpose: "any",
      },
    ],
  };
}
