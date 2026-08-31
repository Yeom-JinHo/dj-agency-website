import type { Metadata } from "@/types/metadata";

const metadata: Metadata = {
  author: {
    name: "ye0m2",
    username: "ye0m2",
    label: "Developer",
  },
  site: {
    title: "Intro",
    description: "Choose a destination.",
    url: "https://intro.vflabs.com",
    keywords: ["Intro", "Portal"],
    language: "en",
    charset: "UTF-8",
    // Served by the app/opengraph-image.tsx file convention, which Next exposes
    // at /opengraph-image.png. Matching that path here keeps the factory-emitted
    // og:image/twitter:image in sync with the generated card and overrides the
    // factory's default "/og" reference so no separate route is needed.
    ogImage: "/opengraph-image.png",
  },
};

export { metadata };
