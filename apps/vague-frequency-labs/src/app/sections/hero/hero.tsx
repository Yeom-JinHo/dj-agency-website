import Globe from "@/components/Globe";

function Hero() {
  return (
    <section className="relative h-[100svh] overflow-x-hidden">
      <div className="flex h-full flex-col items-center justify-center gap-6 md:gap-12">
        <h1 className="w-full text-center text-4xl font-bold">We are</h1>
        <div className="md:scale-90 lg:scale-80">
          <Globe />
        </div>
        <h1 className="w-full text-center text-3xl font-bold">
          Vague Frequency Labs
        </h1>
      </div>
    </section>
  );
}

export default Hero;
