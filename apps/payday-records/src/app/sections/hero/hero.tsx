import Image from "next/image";
import { BlurFade } from "@repo/ui/common/BlurFade";

function Hero() {
  return (
    <section className="relative flex h-[100vh] items-center justify-center">
      {/* Visually-hidden page heading: the brand is shown as the logo image,
          but crawlers and screen readers need a real h1 stating the topic. */}
      <h1 className="sr-only">Payday Records — Independent Music Label</h1>
      {/* 모바일에서 인트로 다이브 보울 중심(화면 중앙보다 위)과 로고 착지점을
          맞추기 위해 살짝 위로 보정. 데스크탑(sm↑)은 vmin 기준이 달라 보정 불필요. */}
      <div className="-translate-y-[4vw] sm:translate-y-0">
        <BlurFade>
          <Image
            src="/images/logo/400_300/PAYDAY.webp"
            alt="Payday Records"
            width={900}
            height={600}
            priority
          />
        </BlurFade>
      </div>
    </section>
  );
}

export default Hero;
