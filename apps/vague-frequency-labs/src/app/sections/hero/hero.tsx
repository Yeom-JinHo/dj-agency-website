import Globe from "@/components/Globe";

function Hero() {
  return (
    <section className="relative h-[100svh]">
      <div className="top-0 flex h-[100svh] items-center justify-center overflow-x-hidden">
        <h1 className="absolute top-[18svh] w-full text-center text-4xl font-bold md:top-[10svh]">
          We are
        </h1>
        <div className="md:scale-90 lg:scale-80">
          <Globe />
        </div>
        <h1 className="absolute bottom-[18svh] w-full text-center text-3xl font-bold md:bottom-[10svh]">
          Vague Frequency Labs
        </h1>
      </div>
    </section>
  );
}

export default Hero;
