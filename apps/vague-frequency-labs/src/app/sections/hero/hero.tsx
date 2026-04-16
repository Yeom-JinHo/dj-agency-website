import Globe from "@/components/Globe";

function Hero() {
  return (
    <section className="relative h-[100vh]">
      <div className="top-0 flex h-screen items-center justify-center overflow-x-hidden">
        <h1 className="absolute top-[18vh] w-full text-center text-4xl font-bold md:top-[10vh]">
          We are
        </h1>
        <div className="md:scale-90 lg:scale-80">
          <Globe />
        </div>
        <h1 className="absolute bottom-[18vh] w-full text-center text-3xl font-bold md:bottom-[10vh]">
          Vague Frequency Labs
        </h1>
      </div>
    </section>
  );
}

export default Hero;
