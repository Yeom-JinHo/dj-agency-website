import ScrollVelocity from "@repo/ui/common/ScrollVelocity";
import TextReveal from "@repo/ui/common/TextReveal";

function About() {
  return (
    <section className="section-gap w-full" id="about">
      {/* 마퀴는 장식층 — 아웃라인 처리로 채운 흰색인 섹션 헤딩(ABOUT)보다
          위계를 한 단계 낮게 유지한다. 채우면 제목과 위계가 충돌함. */}
      <ScrollVelocity
        texts={["Payday", "Records"]}
        className="font-display text-transparent [-webkit-text-stroke:1.5px_#fafafa66]"
      />
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
