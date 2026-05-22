import type { Release } from "@/types/release";

// 발매 정보는 여기에 추가합니다. artwork는 로컬 /public 경로만 사용.
// artwork를 비워두면 그라데이션 카드로 렌더됩니다.
const releases: Release[] = [
  {
    title: "On Your Knees",
    artist: "Sam Collins",
    artwork: "/images/release/on-your-knees.webp",
    href: "https://open.spotify.com/album/1u7feUZVMDcAlTxezTAnu5",
  },
];

export { releases };
