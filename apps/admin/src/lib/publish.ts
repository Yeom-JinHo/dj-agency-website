import "server-only";
import { publish } from "@repo/content/publish";
import type { SiteSlug } from "@repo/content/schema";

/**
 * 발행(소속 사이트 revalidate) 실행 후 편집자용 경고 문자열을 돌려준다.
 * 저장은 이미 커밋됐으므로 발행 실패가 액션 전체를 실패로 만들지 않게(§4.3):
 * 실패·예외를 모두 경고로 흡수하고, 폼/삭제 버튼의 warning 토스트가 표시한다.
 * 성공 시 null. 태그는 반드시 호출부에서 contentTags 빌더로 조립(리터럴 금지).
 */
export async function publishOrWarn(
  tags: string[],
  site: SiteSlug,
  mode: "save" | "delete" = "save",
): Promise<string | null> {
  // delete는 재저장할 대상이 없어 재시도 안내가 부적합 — 다음 저장 시 리스트 태그가
  // 재무효화되며 자기 치유되므로 그 사실을 안내한다(§4.3 피드백, 리뷰 M1 A안).
  const retry =
    mode === "delete"
      ? "이 사이트의 콘텐츠를 다음에 저장할 때 자동으로 반영됩니다."
      : "잠시 후 다시 저장해 발행을 재시도하세요.";
  const prefix =
    mode === "delete" ? "삭제됐지만" : "저장됐지만";
  try {
    const result = await publish(tags, site);
    if (result.ok) return null;
    return `${prefix} 사이트 반영(발행)에 실패했습니다: ${result.site} (${result.error ?? "알 수 없는 오류"}). ${retry}`;
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err);
    return `${prefix} 사이트 반영(발행)에 실패했습니다: ${site} (${reason}). ${retry}`;
  }
}
