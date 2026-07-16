import { useTranslations } from "next-intl";
import TextReveal from "@repo/ui/common/TextReveal";
import SectionHeading from "@/components/SectionHeading";

function About() {
  const t = useTranslations("About");
  return (
    <section
      className="w-full border-t border-border py-24 lg:py-32"
      id="about"
    >
      <div className="grid gap-10">
        <div className="flex w-full flex-col items-center justify-center px-6 text-center md:px-10 lg:flex-row lg:items-start lg:justify-between lg:px-16 lg:text-left">
          <div className="flex flex-col items-center lg:items-start">
            <SectionHeading as="h2">About</SectionHeading>
          </div>
          <TextReveal
            as="p"
            className="mt-6 max-w-[640px] text-muted-foreground lg:mt-2 lg:w-[45%] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed [overflow-wrap:anywhere]"
          >
            {t("body")}
          </TextReveal>
        </div>
      </div>
    </section>
  );
}

export default About;
