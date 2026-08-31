import { setRequestLocale } from "next-intl/server";
import { localizedMetadata } from "@/utils/index";
import ContactContent from "./ContactContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return localizedMetadata({
    locale,
    path: "/contact",
    namespace: "contact",
    keywords: ["Booking", "Contact", "Collaboration", "Music Label", "Seoul"],
  });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ContactContent />;
}
