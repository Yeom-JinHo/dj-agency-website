import { adminListArtists } from "@repo/content/admin-queries";
import type { SiteSlug } from "@repo/content/schema";

import { hasSiteCategory } from "@/lib/sites";

/**
 * 릴리즈·투어 폼의 로스터 셀렉트 옵션(같은 사이트 소속 아티스트).
 *
 * 아티스트를 노출하지 않는 사이트(SITE_CATEGORY_SEGMENTS)에선 폼이 셀렉트를 렌더하지
 * 않으므로 조회 자체를 건너뛴다 — 안 그리는 목록을 매 편집 화면마다 DB에서 길어 올릴
 * 이유가 없다. 판정을 폼(클라이언트)과 이 페이지(서버)가 같은 hasSiteCategory로 공유해
 * "조회는 하는데 안 그린다"·"그리는데 옵션이 없다"가 어긋날 여지를 없앤다.
 *
 * id·name만 남기는 건 셀렉트가 쓰는 필드가 그 둘뿐이기 때문 — Artist 전체를 넘기면
 * 설명·이미지 경로까지 클라이언트 번들로 직렬화된다.
 */
export async function rosterOptions(
  site: SiteSlug
): Promise<{ id: string; name: string }[]> {
  if (!hasSiteCategory(site, "artists")) return [];
  const artists = await adminListArtists(site);
  return artists.map(({ id, name }) => ({ id, name }));
}
