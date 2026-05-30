import ScrollVelocity from "@repo/ui/common/ScrollVelocity";
import TextReveal from "@repo/ui/common/TextReveal";

function About() {
  return (
    <section className="section-gap w-full" id="about">
      <ScrollVelocity texts={["Payday", "Records"]} className="font-display" />
      <div className="mt-24 flex flex-col items-center px-4 text-center">
        <TextReveal as="h2" className="section-heading">
          About
        </TextReveal>
        <TextReveal
          as="p"
          className="mt-6 max-w-[640px] text-base/relaxed text-neutral-400 md:text-lg/relaxed"
        >
          Payday Records is an independent music label crafting a sound that
          moves between deep house, melodic techno, and the textures in
          between. We release records, curate playlists, and bring artists
          to the floor.
        </TextReveal>
      </div>
    </section>
  );
}

export default About;
