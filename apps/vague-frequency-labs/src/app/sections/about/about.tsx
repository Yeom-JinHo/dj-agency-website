import TextReveal from "@repo/ui/common/TextReveal";
import SectionHeading from "@/components/SectionHeading";

function About() {
  return (
    <section className="w-full py-24 lg:py-32" id="about">
      <div className="grid gap-10">
        <div className="flex w-full flex-col items-center justify-center px-4 text-center md:px-6 lg:flex-row lg:items-start lg:justify-between lg:text-left">
          <div className="flex flex-col items-center lg:items-start">
            <SectionHeading as="h2">About</SectionHeading>
          </div>
          <TextReveal
            as="p"
            className="mt-6 max-w-[640px] text-muted-foreground lg:mt-2 lg:w-[45%] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
          >
            Vague Frequency Laboratory의 소개 Vague Frequency Laboratory Vague
            Frequency Laboratory Vague Frequency LaboratoryVague Frequency
            Laboratory Vague Frequency LaboratoryVague Frequency Laboratory
          </TextReveal>
        </div>
      </div>
    </section>
  );
}

export default About;
