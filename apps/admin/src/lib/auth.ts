import "server-only";
import { cache } from "react";
import type { User } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@repo/content/supabase/server";
import { SITE_SLUGS, type SiteSlug } from "@repo/content/schema";

/**
 * admin 인증·인가 단일 출처. 두 층이 분리돼 있다:
 * - **인증**: 로그인 세션(proxy.ts 미들웨어가 1차, 여기가 2차 방어).
 * - **인가**: `editors` 멤버십 = "admin에 들어올 수 있다",
 *   `editor_sites` = "그중 어느 사이트를 편집할 수 있다"(마이그레이션 0002).
 *
 * 최종 방어선은 DB의 RLS다 — 여기 함수들은 UI를 맞게 그리고(못 만질 사이트를 아예
 * 안 보여준다) 액션이 Storage 업로드·발행 같은 부수효과를 시작하기 전에 값싸게
 * 끊기 위한 앞단이다. 이걸 우회해도 RLS가 쓰기를 거부한다.
 *
 * `cache`로 감싸 요청당 1회만 조회한다 — (dashboard)/layout, 대시보드 페이지,
 * [site]/layout, 서버 액션이 한 요청 안에서 같은 세션을 각자 묻기 때문이다.
 */

export type AdminSession = {
  user: User;
  /** 이 편집자가 편집할 수 있는 사이트. SITE_SLUGS 순서를 유지한다(화면 정렬이 일정하도록). */
  allowedSites: SiteSlug[];
};

/**
 * 로그인 + editors 멤버십을 모두 통과한 세션, 아니면 null.
 * editors에 없으면 접근 가능한 사이트가 0개인 것과 구분하지 않고 null을 준다 —
 * 전자는 "admin 사용자가 아님", 후자는 "사용자지만 부여된 사이트가 없음"이라
 * 호출 측에서 안내를 다르게 줄 수 있어야 하므로 후자는 allowedSites: []로 살려둔다.
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // 두 조회는 서로 의존하지 않는다 — editors가 비어 있으면 아래에서 버릴 뿐이라
  // 왕복을 직렬로 쌓지 않는다. 둘 다 self-read RLS로 본인 행만 보인다.
  const [{ data: editor }, { data: grants }] = await Promise.all([
    supabase
      .from("editors")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("editor_sites").select("site_slug").eq("user_id", user.id),
  ]);

  if (!editor) return null;

  // DB의 site_slug는 text라 SITE_SLUGS로 교차 필터해 SiteSlug로 좁힌다 —
  // sites에 없는 값이 들어올 일은 FK가 막지만, 타입 경계는 여기서 닫는다.
  const granted = new Set(grants?.map((row) => row.site_slug) ?? []);
  return { user, allowedSites: SITE_SLUGS.filter((slug) => granted.has(slug)) };
});

/** 현재 편집자가 해당 사이트를 편집할 수 있는지. 미로그인·비편집자는 false. */
export async function canEditSite(site: SiteSlug): Promise<boolean> {
  const session = await getAdminSession();
  return session?.allowedSites.includes(site) ?? false;
}

/**
 * 서버 액션용 가드. 권한이 없으면 throw — 액션들은 모두 try/catch로 감싸
 * `{ ok: false, error }`로 변환하므로 이 메시지가 그대로 토스트에 뜬다.
 * 사이트 파싱 직후, Storage 업로드·발행 등 부수효과가 시작되기 전에 호출한다.
 */
export async function assertSiteAccess(site: SiteSlug): Promise<void> {
  if (!(await canEditSite(site))) {
    throw new Error("이 사이트를 편집할 권한이 없습니다.");
  }
}
