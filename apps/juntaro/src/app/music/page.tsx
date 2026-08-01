import type { Metadata } from "next";
import type { JuntaroTrack } from "@/types/music";

import { getReleases } from "@repo/content/queries";
import { mediaUrl } from "@repo/content/media";
import type { Release } from "@repo/content/schema";
import { BlurFade } from "@repo/ui/common/BlurFade";
import type { IconName } from "@repo/ui/common/Icon";

import { Footer } from "@/components/footer";
import { DeviceTiltScope } from "@/components/music/DeviceTiltScope";
import { MusicCard } from "@/components/music/MusicCard";

export const metadata: Metadata = {
  title: "Music — Juntaro",
};

/**
 * platform_links(5키) → 트랙 모달 링크 행. 기존 consts/tracks.ts의 trackLinks()가
 * 낳던 순서(Spotify → Apple Music → Beatport)와 아이콘·라벨을 그대로 재현한다.
 * SoundCloud/YouTube Music은 juntaro 릴리즈 데이터엔 없어 현재는 no-op이지만,
 * 5키 계약을 온전히 반영해 둔다.
 */
const LINK_SPECS: {
  key: keyof Release["platformLinks"];
  platform: string;
  iconName: IconName;
}[] = [
  { key: "spotify", platform: "Spotify", iconName: "SiSpotify" },
  { key: "appleMusic", platform: "Apple Music", iconName: "SiApple" },
  { key: "beatport", platform: "Beatport", iconName: "SiBeatport" },
  { key: "soundcloud", platform: "SoundCloud", iconName: "SiSoundcloud" },
  { key: "youtubeMusic", platform: "YouTube Music", iconName: "SiYoutube" },
];

/** 도메인 Release → 기존 JuntaroTrack props 어댑터(UI 무변경, 데이터 계층만 교체). */
function toTrack(release: Release): JuntaroTrack {
  return {
    id: release.slug,
    name: release.title,
    artist: release.artistCredit ?? undefined,
    cover: mediaUrl(release.artworkPath) ?? "",
    shortDescription: release.shortDescriptionEn ?? undefined,
    links: LINK_SPECS.flatMap((spec) => {
      const href = release.platformLinks[spec.key];
      return href
        ? [{ platform: spec.platform, href, iconName: spec.iconName }]
        : [];
    }),
  };
}

// 카드별 리듬 값 (인덱스 기반, deterministic). 실데이터 15곡에 맞춰 rot/dy를 15칸으로 확장.
const ROTS = [-3, 2.5, -2, 3, -2.5, 2, -3.5, 1.5, -1.5, 3.5, -2.8, 2.2, -3.2, 1.8, -2.2];
const DYS = [0, 40, 14, 46, 24, 8, 36, 18, 44, 12, 30, 4, 42, 20, 34];

interface CollageCard {
  track: JuntaroTrack;
  rot: number;
  dy: number;
  z: number;
  priority: boolean;
}

export default async function MusicPage() {
  // 커버 없는 릴리즈는 제외 — MusicCard/TrackModal이 <Image src>를 요구하고(빈 문자열은
  // next/image 에러), 원본 계약도 "트랙엔 항상 커버 존재"였다(리뷰 가드).
  const tracks = (await getReleases("juntaro"))
    .filter((release) => mediaUrl(release.artworkPath) !== null)
    .map(toTrack);
  const collageCards: CollageCard[] = tracks.map((track, i) => ({
    track,
    rot: ROTS[i % ROTS.length]!,
    dy: DYS[i % DYS.length]!,
    z: 2 + ((i * 5) % 6),
    // 초기 뷰포트에 들어오는 상단 카드만 우선 로드 — LCP 단축.
    priority: i < 5,
  }));

  return (
    <main className="flex min-h-dvh flex-col">
      {/* 헤더 내비가 활성 밑줄로 현재 페이지를 이미 지목하므로 제목은 접근성용으로만 둔다. */}
      <h1 className="sr-only">Music</h1>
      <div className="flex flex-1 items-center justify-center px-6 pt-24 pb-16 md:px-10 md:pt-32 lg:px-16">
        {/* 데스크톱: overlapping collage */}
        <div className="hidden w-full justify-center lg:flex">
          {/* isolate: 카드 hover:!z-[60]을 이 컨테이너의 스태킹 컨텍스트에 가둬 body 포털 모달(z-50)을 넘지 못하게 한다 — 오버레이는 body 포털 + z-50대, 이 컨테이너는 z-auto 유지가 전제 */}
          <div className="isolate flex max-w-[940px] flex-wrap items-start justify-center xl:max-w-[1140px]">
            {collageCards.map((c) => (
              <div
                key={c.track.id}
                className="relative transition-transform duration-300 ease-out hover:!z-[60] hover:!rotate-0 hover:scale-[1.05] motion-reduce:transition-none"
                style={{
                  margin: "0 -28px -26px",
                  marginTop: c.dy,
                  zIndex: c.z,
                  transform: `rotate(${c.rot}deg)`,
                }}
              >
                <BlurFade inView duration={0.6}>
                  <MusicCard
                    track={c.track}
                    priority={c.priority}
                    cardClassName="h-[228px] w-[228px] shadow-[0_24px_60px_rgba(0,0,0,0.18)] outline outline-1 outline-[#111111]/10 xl:h-[272px] xl:w-[272px]"
                  />
                </BlurFade>
              </div>
            ))}
          </div>
        </div>

        {/* 모바일: 미니 collage */}
        <div className="flex w-full justify-center lg:hidden">
          {/* isolate: 카드 active:!z-[60]을 이 컨테이너의 스태킹 컨텍스트에 가둬 body 포털 모달(z-50)을 넘지 못하게 한다 — 오버레이는 body 포털 + z-50대, 이 컨테이너는 z-auto 유지가 전제 */}
          {/* DeviceTiltScope: 모바일 자이로 그리드 틸트 엔진 + 첫 터치 권한 게이트 호스트 (coarse pointer 한정) */}
          <DeviceTiltScope className="isolate flex max-w-[380px] flex-wrap items-start justify-center sm:max-w-[440px]">
            {collageCards.map((c) => (
              <div
                key={c.track.id}
                className="relative transition-transform duration-300 ease-out active:!z-[60] active:!rotate-0 active:scale-[1.05] motion-reduce:transition-none"
                style={{
                  margin: "0 -12px -14px",
                  marginTop: Math.round(c.dy * 0.5),
                  zIndex: c.z,
                  transform: `rotate(${c.rot}deg)`,
                }}
              >
                <BlurFade inView duration={0.6}>
                  <MusicCard
                    track={c.track}
                    priority={c.priority}
                    cardClassName="h-[172px] w-[172px] shadow-[0_18px_40px_rgba(0,0,0,0.16)] outline outline-1 outline-[#111111]/10 sm:h-[196px] sm:w-[196px]"
                  />
                </BlurFade>
              </div>
            ))}
          </DeviceTiltScope>
        </div>
      </div>
      <Footer />
    </main>
  );
}
