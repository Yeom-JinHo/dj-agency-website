import { getTranslations, setRequestLocale } from "next-intl/server";
import { createMetadata, localeAlternates, ogLocale } from "@/utils/index";
import ContactContent from "./ContactContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata.contact" });
  const title = t("title");
  const description = t("description");
  return createMetadata({
    title,
    description,
    keywords: ["Booking", "Contact", "Collaboration", "Music Label", "Seoul"],
    openGraph: {
      url: "/contact",
      title,
      description,
      locale: ogLocale(locale),
    },
    twitter: {
      title,
      description,
    },
    alternates: localeAlternates("/contact", locale),
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
