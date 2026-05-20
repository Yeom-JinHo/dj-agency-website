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
    icons: [
      {
        src: "/icon.png",
        type: "image/png",
        sizes: "any",
      },
      {
        src: "/apple-icon.png",
        type: "image/png",
        sizes: "any",
      },
    ],
  };
}
