import Image from "next/image";
import { BlurFade } from "@repo/ui/common/BlurFade";

function Hero() {
  return (
    <section className="relative flex h-[100vh] items-center justify-center">
      {/* Visually-hidden page heading: the brand is shown as the logo image,
          but crawlers and screen readers need a real h1 stating the topic. */}
      <h1 className="sr-only">Payday Records — Independent Music Label</h1>
      <BlurFade>
        <Image
          src="/images/logo/400_300/PAYDAY.webp"
          alt="Payday Records"
          width={900}
          height={600}
          priority
        />
      </BlurFade>
    </section>
  );
}

export default Hero;
