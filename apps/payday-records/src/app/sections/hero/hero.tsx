import Image from "next/image";
import { IconChevronDown } from "@tabler/icons-react";
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
            sizes="(max-width: 640px) 320px, (max-width: 1024px) 600px, 900px"
            priority
          />
        </BlurFade>
      </div>
      <a
        href="#about"
        aria-label="Scroll to next section"
        className="absolute bottom-[8vh] left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 p-2 text-white/55 transition-colors hover:text-white/85 focus-visible:text-white/85 focus-visible:outline-none"
      >
        <span className="font-display text-[10px] tracking-[0.3em] uppercase">
          Scroll
        </span>
        <IconChevronDown
          className="h-5 w-5 animate-bounce motion-reduce:animate-none"
          stroke={2}
        />
      </a>
    </section>
  );
}

export default Hero;
