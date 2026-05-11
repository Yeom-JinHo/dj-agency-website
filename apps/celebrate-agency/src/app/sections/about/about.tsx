import { SectionHead } from "@/components/SectionHead";

export default function About() {
  return (
    <section
      id="about"
      className="relative overflow-hidden border-t border-ca-line px-10 py-[140px]"
    >
      <SectionHead
        num="05"
        numLabel="MANIFESTO"
        title="Rules"
        aside="Three."
      />
      <p className="max-w-[1200px] font-display text-[clamp(40px,5.2vw,80px)] uppercase leading-[1.05] tracking-[-0.005em]">
        Small roster<span className="italic text-ca-red">.</span>
        <br />
        Artist over deck<span className="italic text-ca-red">.</span>
        <br />
        Answer on saturday<span className="italic text-ca-red">.</span>
      </p>
    </section>
  );
}
