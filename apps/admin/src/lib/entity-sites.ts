import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@repo/content/supabase/types";
import type { SiteSlug } from "@repo/content/schema";

/** 엔티티↔사이트 조인 테이블(Artist/Release/Tour 공용). */
export type EntitySiteTable = "artist_sites" | "release_sites" | "tour_sites";
export type EntitySiteIdColumn = "artist_id" | "release_id" | "tour_id";

/**
 * 조인 테이블을 폼 상태에 맞춘다: 체크된 사이트는 upsert(sort_order 갱신),
 * 빠진 사이트는 delete. 전량 teardown 대신 diff로 최소 변경.
 * table/idColumn을 동적으로 받으므로 내부에서 느슨한 핸들로 접근한다
 * (호출 측은 타입된 클라이언트를 전달).
 */
export async function syncEntitySites(
  supabase: SupabaseClient<Database>,
  table: EntitySiteTable,
  idColumn: EntitySiteIdColumn,
  id: string,
  sites: { siteSlug: SiteSlug; sortOrder: number }[],
): Promise<void> {
  // 동적 table/idColumn 접근을 위해 스키마 제네릭을 벗은 핸들(레이아웃 editors 캐스팅과 동일 패턴).
  const db = supabase as unknown as SupabaseClient;

  if (sites.length > 0) {
    const rows = sites.map((s) => ({
      [idColumn]: id,
      site_slug: s.siteSlug,
      sort_order: s.sortOrder,
    }));
    const { error } = await db
      .from(table)
      .upsert(rows, { onConflict: `${idColumn},site_slug` });
    if (error) throw new Error(`사이트 노출 갱신 실패: ${error.message}`);
  }

  const keep = sites.map((s) => s.siteSlug);
  let del = db.from(table).delete().eq(idColumn, id);
  if (keep.length > 0) {
    del = del.not("site_slug", "in", `(${keep.join(",")})`);
  }
  const { error } = await del;
  if (error) throw new Error(`사이트 노출 정리 실패: ${error.message}`);
}
