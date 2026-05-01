import Image from "next/image";
import { BlurFade } from "@repo/ui/common/BlurFade";

function Hero() {
  return (
    <section className="relative flex h-[100vh] items-center justify-center px-4">
      <BlurFade>
        <Image
          src="/images/logo/400_300/PAYDAY.png"
          alt="Payday Records"
          width={900}
          height={600}
          priority
          sizes="(max-width: 768px) 90vw, 900px"
          className="h-auto w-full max-w-[900px]"
        />
      </BlurFade>
    </section>
  );
}

export default Hero;
