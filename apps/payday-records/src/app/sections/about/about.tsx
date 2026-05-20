import React from "react";
import ScrollVelocity from "@repo/ui/common/ScrollVelocity";
import TextReveal from "@repo/ui/common/TextReveal";
import MotionWrap from "@repo/ui/common/MotionWrap";

function About() {
  return (
    <MotionWrap className="w-full py-24 lg:py-32" id="about">
      <ScrollVelocity texts={["Payday", "Records"]} className="font-display" />
      <div className="mt-24 flex flex-col items-center px-4 text-center">
        <span className="section-kicker mb-5">01 — Label</span>
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
    </MotionWrap>
  );
}

export default About;
