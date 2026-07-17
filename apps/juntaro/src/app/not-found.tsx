import Link from "next/link";

import { Footer } from "@/components/footer";

/**
 * 순백 포스터 어휘의 404 — 형제 앱들의 공유 Intro 허브(AppId 3사 한정·다크 톤)는
 * 아티스트 마이크로사이트에 부적합해 juntaro 고유 어휘로 별도 구성한다.
 * 모노 캡션 → Anton 디스플레이 → 내비 밑줄 어휘의 홈 복귀 링크 위계.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col">
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 pt-16 text-center md:px-10 md:pt-20">
        <p className="font-mono text-[11px] font-medium tracking-[0.3em] text-[#111111]/70 uppercase">
          404
        </p>
        <h1 className="font-display text-[clamp(2.5rem,9vw,6rem)] leading-[0.9] tracking-[0.01em] text-[#111111] uppercase">
          Page Not Found
        </h1>
        <Link
          href="/"
          className={
            "font-mono text-[13px] tracking-[0.25em] text-[#111111] uppercase " +
            "pb-px bg-[image:linear-gradient(currentColor,currentColor)] bg-[position:0_100%] bg-no-repeat " +
            "bg-[length:calc(100%-0.25em)_1px] opacity-70 transition-opacity duration-200 ease-out " +
            "hover:opacity-100 focus-visible:opacity-100 motion-reduce:transition-none"
          }
        >
          Back to home
        </Link>
      </div>
      <Footer />
    </main>
  );
}
