import Image from "next/image";
import { BlurFade } from "@repo/ui/common/BlurFade";

function Hero() {
  return (
    <section className="relative flex h-[100vh] items-center justify-center">
      <BlurFade>
        <Image
          src="/images/logo/400_300/PAYDAY.png"
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
