import React from "react";
import ScrollVelocity from "@repo/ui/common/ScrollVelocity";
import TextReveal from "@repo/ui/common/TextReveal";
import MotionWrap from "@repo/ui/common/MotionWrap";

function About() {
  return (
    <MotionWrap className="w-full py-24 lg:py-32" id="about">
      <ScrollVelocity texts={["Payday", "Records"]} />
      <div className="mt-16 flex items-center justify-center md:mt-40">
        <div className="space-y-4 px-4">
          <TextReveal
            as="h2"
            className="text-4xl leading-tight font-bold tracking-tighter sm:text-5xl md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight"
          >
            About
          </TextReveal>
          <div className="space-y-4">
            <TextReveal
              as="p"
              className="max-w-[700px] text-base/relaxed text-gray-500 md:text-lg/relaxed lg:text-xl/relaxed dark:text-gray-400"
            >
              payday records의 소개 payday records payday records payday records
              payday records payday records payday records payday records payday
              records payday records payday records payday records payday
              records payday records payday records payday records payday
              records
            </TextReveal>
          </div>
        </div>
      </div>
    </MotionWrap>
  );
}

export default About;
