import type { ReactElement } from "react";
import { createMetadata } from "@/utils/index";
import ContactContent from "./ContactContent";

const title = "Contact & Booking";
const description =
  "Contact Vague Frequency Laboratory for bookings, releases, and collaborations with our Seoul-based independent electronic music label and its artists.";

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
