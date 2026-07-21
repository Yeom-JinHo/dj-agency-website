import type { Release } from "@/types/release";

// [CMS 전환됨] 이 하드코딩 데이터는 더 이상 사이트가 소비하지 않는다 — 발매 정보는 admin에서
// 관리하고 release 섹션은 @repo/content(getReleases)를 소비한다. 시드 스크립트 참조용으로만 잔존.
// artwork를 비워두면 그라데이션 카드로 렌더됩니다.
// links에 값이 있는 플랫폼만 모달에 노출됩니다 (beatport / spotify / appleMusic / soundcloud / youtubeMusic).
const releases: Release[] = [
  {
    title: "On Your Knees",
    artist: "Sam Collins",
    artwork: "/images/release/on-your-knees.webp",
    links: {
      spotify: "https://open.spotify.com/album/1u7feUZVMDcAlTxezTAnu5",
    },
  },
];

export { releases };
