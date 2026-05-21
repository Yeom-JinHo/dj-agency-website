import type { Metadata } from "@/types/metadata";

const metadata: Metadata = {
  author: {
    name: "ye0m2",
    username: "ye0m2",
    label: "Developer",
  },
  site: {
    title: "Payday Records",
    description: "Payday Records is an independent music label.",
    url: "https://payday-records.com",
    keywords: ["Payday Records"],
    language: "en",
    charset: "UTF-8",
  },
};

// Single source of truth for the static OG/Twitter share image (see public/og-image.jpg).
// jpg (not webp) for SNS scraper compatibility — see .omc/plans/payday-records-seo-consensus.md.
const ogImage = {
  url: "/og-image.jpg",
  width: 1200,
  height: 630,
  alt: "Payday Records",
} as const;

export { metadata, ogImage };
