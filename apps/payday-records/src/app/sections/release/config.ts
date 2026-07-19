import type { Release } from "@/types/release";

import onYourKneesArtwork from "../../../../public/images/release/on-your-knees.webp";

// 발매 정보는 여기에 추가합니다. artwork는 public의 webp를 정적 import로 지정.
// artwork를 비워두면 그라데이션 카드로 렌더됩니다.
// links에 값이 있는 플랫폼만 모달에 노출됩니다 (beatport / spotify / appleMusic / soundcloud / youtubeMusic).
const releases: Release[] = [
  {
    title: "On Your Knees",
    artist: "Sam Collins",
    artwork: onYourKneesArtwork,
    links: {
      spotify: "https://open.spotify.com/album/1u7feUZVMDcAlTxezTAnu5",
    },
  },
];

export { releases };
