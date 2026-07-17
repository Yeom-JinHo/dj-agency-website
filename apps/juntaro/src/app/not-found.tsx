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
      <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 pt-16 md:px-10 md:pt-20">
        {/* hero 에코 레이어 재사용(7% 블러 유령 워드마크) — "사라진 페이지" 위 잔상.
            hero와 달리 3D 씬이 없어 정적 텍스처로만 깔고, 콘텐츠 블록이 relative로 위에 얹힌다. */}
        {/* eslint-disable-next-line @next/next/no-img-element -- 장식용 블러 에코, 이미지 최적화 불필요 */}
        <img
          src="/images/logo.webp"
          alt=""
          aria-hidden
          className="absolute top-1/2 left-1/2 w-[min(82vw,110dvh)] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-[0.07] blur-[7px] invert"
        />
        <div className="relative flex flex-col items-center gap-6 text-center">
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
      </div>
      <Footer />
    </main>
  );
}
