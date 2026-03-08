import Globe from "@/components/Globe";

function Hero() {
  return (
    <section className="relative h-[100vh]">
      <div className="top-0 flex h-screen items-center justify-center overflow-x-hidden">
        <h1 className="absolute top-[15vh] text-4xl font-bold md:top-[10vh]">
          We are
        </h1>
        <div className="w-full scale-100 md:scale-90 lg:scale-80">
          <Globe />
        </div>
        <h1 className="absolute bottom-[15vh] text-3xl font-bold md:bottom-[10vh]">
          Vague Frequency Labs
        </h1>
      </div>
    </section>
  );
}

export default Hero;
