import type { Metadata } from "@/types/metadata";

const metadata: Metadata = {
  author: {
    name: "ye0m2",
    username: "ye0m2",
    label: "Developer",
  },
  site: {
    title: "Vague Frequency Laboratory",
    description:
      "Independent Seoul electronic music label for experimental tech house and bass house — artists, releases, and live sets from Vague Frequency Laboratory.",
    url: "https://v.f.labs.com",
    keywords: ["Vague Frequency Laboratory"],
    language: "en",
    charset: "UTF-8",
    // Served by the app/opengraph-image.png file convention (replaces the
    // factory's default /og, which has no route in this app).
    ogImage: "/opengraph-image.png",
  },
};

export { metadata };
