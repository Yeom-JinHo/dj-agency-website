import "server-only";
import type { SiteSlug } from "../schema/site";

/**
 * 방식 B 발행 헬퍼. admin server action이 DB 저장 성공 후 호출한다.
 * 대상 사이트에만 revalidate POST(시크릿 헤더). 뮤테이션마다 흩뿌리지 않도록 중앙화.
 * 사이트 base URL + REVALIDATE_SECRET은 admin env로 주입.
 */
export async function publish(
  tags: string[],
  siteSlugs: SiteSlug[],
): Promise<void> {
  void tags;
  void siteSlugs;
  throw new Error("not implemented (P1 Wave 1)");
}
