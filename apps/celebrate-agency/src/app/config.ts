import type { Metadata } from "@/types/metadata";

const metadata: Metadata = {
  author: {
    name: "ye0m2",
    username: "ye0m2",
    label: "Developer",
  },
  site: {
    title: "Celebrate Agency",
    description: "Talent · Production · Direction. Seoul, Korea.",
    url: "https://celebrate-agency.com",
    keywords: [
      "Celebrate Agency",
      "Talent",
      "Production",
      "Direction",
      "Seoul",
    ],
    language: "en",
    charset: "UTF-8",
    // Prebuilt social card served as a static file at public/opengraph-image.png.
    // Overrides the factory's default "/og" reference so no app route is needed.
    ogImage: "/opengraph-image.png",
  },
};

export { metadata };
