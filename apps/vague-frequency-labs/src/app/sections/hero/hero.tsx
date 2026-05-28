import Globe from "@/components/Globe";

function Hero() {
  return (
    <section className="relative h-[100svh] overflow-x-hidden pt-16">
      <div className="flex h-full flex-col items-center justify-center gap-2 pb-4 sm:gap-4 md:gap-6">
        <p className="w-full text-center text-2xl font-medium opacity-80 sm:text-3xl md:text-4xl lg:text-5xl 2xl:text-6xl">
          We are
        </p>
        <Globe className="h-[min(85vw,calc(100svh-10rem))] w-[min(85vw,calc(100svh-10rem))] md:h-[min(70vw,calc(100svh-14rem))] md:w-[min(70vw,calc(100svh-14rem))] lg:h-[min(55vw,calc(100svh-16rem))] lg:w-[min(55vw,calc(100svh-16rem))] 2xl:h-[min(50vw,calc(100svh-18rem))] 2xl:w-[min(50vw,calc(100svh-18rem))]" />
        <h1 className="w-full text-center text-3xl font-bold sm:text-4xl md:text-5xl lg:text-6xl 2xl:text-7xl">
          Vague Frequency Labs
        </h1>
      </div>
    </section>
  );
}

export default Hero;
