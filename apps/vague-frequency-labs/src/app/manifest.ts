import type { MetadataRoute } from "next";
import { metadata as meta } from "@/app/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: meta.site.title,
    short_name: "VFL",
    description: meta.site.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
