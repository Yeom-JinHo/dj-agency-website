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
    // Static OG/Twitter share image at public/og-image.jpg. jpg (not webp) for
    // SNS scraper compatibility — see .omc/plans/payday-records-seo-consensus.md.
    // The factory infers image/jpeg from the extension.
    ogImage: "/og-image.jpg",
  },
};

export { metadata };
