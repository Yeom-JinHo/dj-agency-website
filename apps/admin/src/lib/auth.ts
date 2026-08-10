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
  /**
   * editors 멤버십 통과 여부. false면 로그인은 됐지만 admin 사용자가 아니다 —
   * 이 상태를 null(미로그인)과 뭉치면 로그인 → / → /login으로 되돌려보내는 것 외에
   * 할 수 있는 게 없어져, 당사자는 자기 계정이 거부됐다는 사실조차 듣지 못한다.
   */
  isEditor: boolean;
  /** 이 편집자가 편집할 수 있는 사이트. SITE_SLUGS 순서를 유지한다(화면 정렬이 일정하도록). */
  allowedSites: SiteSlug[];
};

/**
 * 로그인 세션. 미로그인만 null이고, 로그인했다면 판정 결과를 세 단계로 구분해 돌려준다:
 * `isEditor: false`(admin 사용자가 아님) / `allowedSites: []`(사용자지만 부여된 사이트 없음) /
 * 부여 있음. 셋은 사용자가 취할 행동이 서로 다르므로(다른 계정으로 로그인 · 운영자에게
 * 부여 요청 · 그냥 작업) 호출 측이 안내를 나눌 수 있게 여기서 뭉개지 않는다.
 *
 * 조회 자체가 실패하면 throw한다 — "권한 없음"으로 조용히 강등시키지 않는다(아래 참고).
 */
export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // 두 조회는 서로 의존하지 않는다 — editors가 비어 있으면 아래에서 버릴 뿐이라
  // 왕복을 직렬로 쌓지 않는다. 둘 다 self-read RLS로 본인 행만 보인다.
  const [editorResult, grantsResult] = await Promise.all([
    supabase
      .from("editors")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase.from("editor_sites").select("site_slug").eq("user_id", user.id),
  ]);

  // 조회 실패를 "권한 없음"으로 흘려보내지 않는다. data만 보면 순단(Supabase pause·
  // 네트워크 오류)이 곧 권한 박탈로 읽혀, 멀쩡한 편집자가 영문도 모른 채 사이트가
  // 사라진 화면이나 로그인 페이지로 튕긴다. 판정 근거가 없으면 판정하지 않고
  // 에러로 올려 재시도를 안내한다(§4.3 safeCount가 카운트에서 쓰는 것과 같은 원칙 —
  // "실패"와 "0"은 다른 상태다).
  if (editorResult.error) {
    throw new Error(`편집자 확인에 실패했습니다: ${editorResult.error.message}`);
  }
  if (grantsResult.error) {
    throw new Error(
      `사이트 권한 조회에 실패했습니다: ${grantsResult.error.message}`,
    );
  }

  const { data: editor } = editorResult;
  const { data: grants } = grantsResult;

  // editors에 없으면 부여 행이 남아 있어도 allowedSites는 비운다 — RLS 쓰기 정책이
  // 두 조건의 AND라 여기서 부여를 살려두면 UI만 열려 있고 저장에서 거부되는,
  // 가장 나쁜 종류의 불일치가 생긴다.
  if (!editor) return { user, isEditor: false, allowedSites: [] };

  // DB의 site_slug는 text라 SITE_SLUGS로 교차 필터해 SiteSlug로 좁힌다 —
  // sites에 없는 값이 들어올 일은 FK가 막지만, 타입 경계는 여기서 닫는다.
  const granted = new Set(grants?.map((row) => row.site_slug) ?? []);
  return {
    user,
    isEditor: true,
    allowedSites: SITE_SLUGS.filter((slug) => granted.has(slug)),
  };
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
