import "server-only";
import { createServerSupabaseClient } from "../supabase/server";
import { SITE_SLUGS, type SiteSlug } from "../schema/site";

/**
 * 편집자 인가 조회. 콘텐츠 조회(`./queries`·`./admin-queries`)와 물리적으로 분리한다 —
 * 여기서 나오는 값은 화면에 그릴 데이터가 아니라 "무엇을 보여줄지/허용할지"의 근거다.
 *
 * 두 축이 따로 있다(0002 마이그레이션):
 *   - `editors`      — admin에 들어올 수 있는가 (게이트)
 *   - `editor_sites` — 그중 어느 사이트를 만질 수 있는가 (범위)
 * 두 테이블 모두 self-read RLS라 이 조회는 본인 행만 볼 수 있고, 진짜 강제는 엔티티
 * 테이블·Storage의 쓰기 RLS가 한다. 여기 함수들은 UI를 그 강제와 일치시켜
 * "보이는데 저장하면 실패하는" 화면을 없애는 역할이다.
 */

/**
 * admin 접근 자격(= editors 멤버십).
 *
 * 조회 실패를 false로 접는다 — 이 함수의 유일한 소비자인 (dashboard)/layout.tsx는
 * 레이아웃이라 같은 세그먼트의 error.tsx가 잡지 못하고 global-error로 떨어진다.
 * 인가 실패의 기존 착지점(/login)을 유지하는 편이 낫다. fail-closed이므로 오류가
 * 권한을 넓히는 방향으로는 작동하지 않는다.
 */
export async function isEditor(): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("editors")
    .select("user_id")
    .maybeSingle();
  return Boolean(data);
}

/**
 * 현재 편집자가 쓸 수 있는 사이트 목록. 권한이 없으면 빈 배열.
 *
 * isEditor와 달리 조회 실패를 삼키지 않고 throw한다 — 호출부가 페이지((dashboard)/page.tsx)와
 * 하위 레이아웃([site]/layout.tsx)이라 둘 다 (dashboard)/error.tsx 경계 안이다. 빈 배열로
 * 접으면 일시적 DB 오류가 "권한이 없습니다"로 보여 편집자가 자기 권한을 의심하게 된다.
 *
 * 정렬은 SITE_SLUGS 표준 순서 — 대시보드 카드·사이트 스위처가 사용자마다 다른 순서로
 * 흔들리지 않게 한다. DB에 있는 알 수 없는 슬러그(사이트 추가 중 배포 시차 등)는 버린다.
 */
export async function getEditorSites(): Promise<SiteSlug[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("editor_sites")
    .select("site_slug");
  if (error) throw error;

  const granted = new Set((data ?? []).map((row) => row.site_slug));
  return SITE_SLUGS.filter((slug) => granted.has(slug));
}
