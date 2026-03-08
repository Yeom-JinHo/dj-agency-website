import TextReveal from "@repo/ui/common/TextReveal";

function About() {
  return (
    <section className="w-full py-24 lg:py-32" id="about">
      <div className="px-4 md:px-6">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2">
          <div className="space-y-4">
            <TextReveal
              as="h2"
              className="text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight"
            >
              About
            </TextReveal>
            <div className="space-y-4">
              <TextReveal
                as="p"
                className="max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400"
              >
                Vague Frequency Laboratory의 소개 Vague Frequency Laboratory
                Vague Frequency Laboratory Vague Frequency LaboratoryVague
                Frequency Laboratory Vague Frequency LaboratoryVague Frequency
                Laboratory
              </TextReveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
