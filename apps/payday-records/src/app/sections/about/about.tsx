import ScrollVelocity from "@repo/ui/common/ScrollVelocity";
import TextReveal from "@repo/ui/common/TextReveal";

function About() {
  return (
    <section
      className="w-full pt-16 pb-24 lg:pt-20 lg:pb-32"
      id="about"
    >
      <ScrollVelocity texts={["Payday", "Records"]} className="font-display" />
      <div className="mt-24 flex flex-col items-center px-4 text-center">
        <TextReveal as="h2" className="section-heading">
          About
        </TextReveal>
        <TextReveal
          as="p"
          className="mt-6 max-w-[640px] text-base/relaxed text-neutral-400 md:text-lg/relaxed"
        >
          payday records의 소개 payday records payday records payday records
          payday records payday records payday records payday records payday
          records payday records payday records payday records payday records
          payday records payday records payday records payday records
        </TextReveal>
      </div>
    </section>
  );
}

export default About;
