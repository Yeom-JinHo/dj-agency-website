import "server-only";
import { getEditorSites } from "@repo/content/editors";
import type { SiteSlug } from "@repo/content/schema";

/**
 * 서버 액션용 사이트 인가 가드.
 *
 * 라우트는 [site]/layout.tsx가 막지만 **서버 액션은 레이아웃을 거치지 않는다** —
 * 액션 id를 알면 페이지를 열지 않고도 직접 호출할 수 있으므로, 라우트 세그먼트에서
 * 온 site를 신뢰하지 않고 액션 진입부에서 다시 확인한다(siteSlugSchema.parse가
 * "실재하는 슬러그인가"를 보는 것과 같은 자리에서 "내가 만질 수 있는가"를 본다).
 *
 * 최종 강제는 여기가 아니라 쓰기 RLS(editor_sites)다. 이 가드가 있는 이유는 두 가지다:
 *   1) RLS 위반은 액션마다 다른 지점에서 제각각인 Postgres 메시지로 터진다. 그중
 *      delete는 "권한 없음"이 아니라 0행 삭제로 조용히 성공해 보인다.
 *   2) 이미지 업로드가 DB 쓰기보다 먼저 일어나는 경로가 있어, 가드가 없으면 권한
 *      없는 사이트로 요청해도 toWebp·Storage 왕복을 다 태운 뒤에야 막힌다.
 *
 * throw로 알린다 — 액션들이 이미 try/catch + toErrorMessage로 감싸 토스트에 문구를
 * 그대로 싣는다(별도 EntityActionResult 분기를 늘리지 않는다).
 */
export async function assertSiteAccess(site: SiteSlug): Promise<void> {
  const sites = await getEditorSites();
  if (!sites.includes(site)) {
    // 사이트명을 말하지 않는다 — 라우트 가드가 존재 여부를 숨기는 것과 같은 이유.
    throw new Error("이 사이트에 대한 권한이 없습니다.");
  }
}
