import TextReveal from "@repo/ui/common/TextReveal";

function About() {
  return (
    <section className="w-full py-24 lg:py-32" id="about">
      <div className="grid gap-10">
        <div className="flex w-full flex-col items-center justify-center px-4 text-center md:px-6 lg:flex-row lg:items-start lg:justify-between lg:text-left">
          <div className="flex flex-col items-center lg:items-start">
            <TextReveal
              as="h2"
              className="text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight"
            >
              About
            </TextReveal>
          </div>
          <TextReveal
            as="p"
            className="mt-6 max-w-[640px] text-gray-600 lg:mt-2 lg:w-[45%] md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-300"
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
