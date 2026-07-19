import "server-only";
import type { SiteSlug } from "../schema/site";

/**
 * 사이트별 base URL 환경변수 이름. 기존 cross-site URL 컨벤션과 동일
 * (`@repo/utils`의 getAppUrls와 같은 키). content는 브라우저 안전 서브패스를
 * 유지해야 해 workspace 의존을 추가하지 않고 env를 직접 읽는다.
 */
const SITE_URL_ENV: Record<SiteSlug, string> = {
  "vague-frequency-labs": "NEXT_PUBLIC_VAGUE_FREQUENCY_LABS_URL",
  "payday-records": "NEXT_PUBLIC_PAYDAY_RECORDS_URL",
  "celebrate-agency": "NEXT_PUBLIC_CELEBRATE_AGENCY_URL",
  juntaro: "NEXT_PUBLIC_JUNTARO_URL",
};

export interface PublishResult {
  site: SiteSlug;
  ok: boolean;
  error?: string;
}

/**
 * 방식 B 발행 헬퍼. admin server action이 DB 저장 성공 후 호출한다.
 * 소속 모델이라 대상은 엔티티의 소속 사이트 1곳뿐 — 그 사이트에만 revalidate POST
 * (시크릿 헤더). 뮤테이션마다 흩뿌리지 않도록 중앙화.
 * 사이트 base URL + REVALIDATE_SECRET은 admin env로 주입.
 * 성공/실패를 단일 결과로 반환(§7.5) — 편집자에게 발행 피드백.
 */
export async function publish(
  tags: string[],
  site: SiteSlug,
): Promise<PublishResult> {
  const secret = process.env.REVALIDATE_SECRET;
  if (!secret) {
    throw new Error("Missing REVALIDATE_SECRET");
  }

  const envName = SITE_URL_ENV[site];
  const baseUrl = process.env[envName];
  if (!baseUrl) {
    return { site, ok: false, error: `Missing ${envName}` };
  }
  if (process.env.NODE_ENV === "production" && !baseUrl.startsWith("https://")) {
    return {
      site,
      ok: false,
      error: "Insecure base URL (production requires https)",
    };
  }
  try {
    const res = await fetch(`${baseUrl.replace(/\/$/, "")}/api/revalidate`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-revalidate-secret": secret,
      },
      body: JSON.stringify({ tags }),
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      return { site, ok: false, error: `HTTP ${res.status}` };
    }
    return { site, ok: true };
  } catch (err) {
    return {
      site,
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
