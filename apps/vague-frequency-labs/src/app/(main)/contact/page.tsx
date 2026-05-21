import type { ReactElement } from "react";
import { createMetadata } from "@/utils/index";
import ContactContent from "./ContactContent";

const title = "Contact";
// 사용자 검토 필요 (영문 메타 카피 초안)
const description =
  "Get in touch with Vague Frequency Laboratory. Reach out for bookings, releases, and collaboration inquiries with our Seoul-based electronic music label.";

export const metadata = createMetadata({
  title,
  description,
  keywords: ["Booking", "Contact", "Collaboration", "Music Label", "Seoul"],
  openGraph: {
    url: "/contact",
    title,
    description,
  },
  twitter: {
    title,
    description,
  },
  alternates: {
    canonical: "/contact",
  },
});

export default function ContactPage(): ReactElement {
  return <ContactContent />;
}
