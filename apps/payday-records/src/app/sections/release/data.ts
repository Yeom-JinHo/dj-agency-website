import { getReleases } from "@repo/content/queries";
import { mediaUrl } from "@repo/content/media";

import type { Release } from "@/types/release";

// 홈 release 섹션 데이터 어댑터: 도메인 Release(@repo/content) → 섹션 뷰 모델 매핑.
// release.tsx는 client 컴포넌트(모달 상태)라 서버 전용 getReleases를 직접 부를 수
// 없어, 서버 컴포넌트(page.tsx)에서 이 함수로 fetch 후 prop으로 내려준다.
//
// - artist   ← artistCredit (payday는 primaryArtistId 없이 외부 크레딧만 사용)
// - artwork  ← mediaUrl(artworkPath) (Storage 공개 URL, 비어 있으면 그라데이션 카드)
// - links    ← platformLinks (값이 있는 플랫폼만 모달에 노출)
// 목록은 sort_order 정렬 그대로 전량 렌더(기존 releases.map 구조와 동일, N곡 대응).
export async function getReleaseItems(): Promise<Release[]> {
  const releases = await getReleases("payday-records");
  return releases.map((release) => ({
    title: release.title,
    artist: release.artistCredit ?? "",
    artwork: mediaUrl(release.artworkPath) ?? undefined,
    label: release.label ?? undefined,
    catalogNo: release.catalogNo ?? undefined,
    links: release.platformLinks,
  }));
}
