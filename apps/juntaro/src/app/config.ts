import type { Metadata } from "@/types/metadata";

const metadata: Metadata = {
  author: {
    name: "ye0m2",
    username: "ye0m2",
    label: "Developer",
  },
  site: {
    title: "Juntaro",
    description: "Tech House producer and DJ based in Seoul.",
    url: "https://juntaroinyourarea.vercel.app",
    keywords: ["Juntaro", "Tech House", "DJ", "Seoul"],
    language: "en",
    charset: "UTF-8",
    // Served by the app/opengraph-image.png file convention (replaces the
    // factory's default /og, which has no route in this app).
    ogImage: "/opengraph-image.png",
  },
};

export { metadata };
