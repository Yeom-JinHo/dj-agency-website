import type { StaticImageData } from "next/image";
import { SITE_SLUGS, type SiteSlug } from "@repo/content/schema";

import celebrateAgencyIcon from "@/assets/site-icons/celebrate-agency.webp";
import juntaroIcon from "@/assets/site-icons/juntaro.webp";
import paydayRecordsIcon from "@/assets/site-icons/payday-records.webp";
import vagueFrequencyLabsIcon from "@/assets/site-icons/vague-frequency-labs.webp";

/**
 * 사이트-우선 라우트(§8)의 공용 상수. SITE_SLUGS는 @repo/content/schema에서 소비하고,
 * admin UI 표시명·카테고리 라벨을 여기서 매핑한다. 대시보드 카드·사이트 스위처·
 * 카테고리 내비·site 파라미터 검증이 모두 이 한 곳을 공유한다.
 */

/** 사이트 슬러그 → admin 표시명(DB sites.name과 동일). */
export const SITE_LABELS: Record<SiteSlug, string> = {
  "vague-frequency-labs": "Vague Frequency Labs",
  "payday-records": "Payday Records",
  "celebrate-agency": "Celebrate Agency",
  juntaro: "Juntaro",
};

/** admin이 다루는 카테고리 전체 목록. 라우트 세그먼트와 1:1.
 * 어느 사이트가 이 중 무엇을 쓰는지는 아래 SITE_CATEGORY_SEGMENTS가 정한다 —
 * 여기는 "카테고리가 무엇인지"만 담는 카탈로그다.
 * releases 라벨은 목록·버튼·빈 상태의 h1 어휘("릴리즈")와 같은 말을 쓴다 —
 * 내비·브레드크럼·카운트만 "뮤직"이던 이중 어휘를 릴리즈로 통일했다. */
export const CATEGORIES = [
  { segment: "artists", label: "아티스트" },
  { segment: "releases", label: "릴리즈" },
  { segment: "tours", label: "투어" },
] as const;

/** 카테고리 라우트 세그먼트. 카운트를 세그먼트 키로 다루는 화면들이 공유한다. */
export type CategorySegment = (typeof CATEGORIES)[number]["segment"];

/**
 * 사이트별 admin 노출 범위. CATEGORIES가 "카테고리가 무엇인지"의 단일 출처라면
 * 이 맵은 "어느 사이트가 어느 카테고리를 쓰는지"의 단일 출처다 —
 * 사이드바 nav·대시보드/사이트 홈 카운트·스위처 이동 대상·카테고리 라우트 가드·
 * 릴리즈/투어 폼의 로스터 셀렉트가 모두 이 한 맵에서 갈린다.
 *
 * DB가 아니라 코드에 두는 이유: `site_slug` FK는 전역이라 DB는 어느 사이트에나 어떤
 * 엔티티든 넣을 수 있고(0001_init.sql), 실제 제약은 "각 사이트가 무엇을 렌더하는가"라는
 * 개발자 결정이다(cms-plan.md §13 "celebrate-agency 범위 → Artist만"). 편집자가 런타임에
 * 바꾸는 값이 아니므로 컬럼·조회를 늘리지 않는다. 공개 앱이나 publish/revalidate가
 * 이 범위로 분기해야 할 때 @repo/content로 승격한다 — 지금 소비처는 admin뿐.
 *
 * **이 맵이 노출 범위의 정본이다**(cms-plan.md §13이 여기를 가리킨다). 문서에 매트릭스를
 * 복제하면 두 곳을 동기화해야 하고 반드시 한쪽이 낡는다 — 범위를 바꿀 땐 여기만 고친다.
 *
 * 유보한 카테고리와 재검토 조건(현재 범위에서 빠진 것들):
 * - VFL 투어 — 공연 일정을 사이트에 싣기로 하면 연다. 지금 VFL엔 투어 화면이 없다.
 * - payday 아티스트 — 릴리즈가 로스터 FK 없이 artist_credit 문자열만 쓴다. 로스터를
 *   화면에 세우기로 하면 열고, 그때 기존 credit을 아티스트 행으로 옮길지 함께 정한다.
 * - juntaro 아티스트 — 1인 아티스트 사이트라 로스터 개념이 없다. 투어의 artist_id도
 *   공개 화면에서 쓰지 않는다(app/tour/page.tsx).
 * - celebrate 릴리즈·투어 — §13의 "Music/Tour 노출은 향후 필요 시 재검토"가 그대로다.
 */
export const SITE_CATEGORY_SEGMENTS: Record<
  SiteSlug,
  readonly CategorySegment[]
> = {
  "vague-frequency-labs": ["artists", "releases"],
  "payday-records": ["releases"],
  "celebrate-agency": ["artists"],
  juntaro: ["releases", "tours"],
};

/** 해당 사이트가 쓰는 카테고리만 CATEGORIES 순서대로. 라벨이 필요한 렌더가 쓴다. */
export function siteCategories(
  site: SiteSlug
): readonly (typeof CATEGORIES)[number][] {
  return CATEGORIES.filter((c) =>
    SITE_CATEGORY_SEGMENTS[site].includes(c.segment)
  );
}

/** 이 사이트에서 해당 카테고리를 노출하는가(라우트 가드·조건부 필드 판정용). */
export function hasSiteCategory(
  site: SiteSlug,
  segment: CategorySegment
): boolean {
  return SITE_CATEGORY_SEGMENTS[site].includes(segment);
}

/**
 * 아티스트의 로스터 전용 필드(`city`·`selectedWorks`)를 쓰는 사이트.
 *
 * 위 카테고리 맵이 "어느 사이트가 어느 **카테고리**를 쓰는가"라면 이건 한 단 아래,
 * "같은 엔티티 안에서 어느 **필드**를 쓰는가"다. @repo/content의 artist 스키마가
 * 이미 "`city`/`selectedWorks`는 celebrate roster용(다른 사이트는 비움)"이라
 * 못 박았고 소비처도 그렇다 — celebrate만 로스터·모달에서 렌더하고, VFL 어댑터
 * (content-adapters.ts)는 두 필드를 아예 매핑하지 않는다. 그래서 VFL 편집자에게
 * "대표 작업"은 채워도 사이트에 안 나오는 칸이고, "등록된 작업이 없습니다"는
 * *아직 안 채운 것*으로 오독된다.
 *
 * 감춰도 값은 지우지 않고 렌더만 막는다 — 이유는 release-form.tsx의 로스터
 * 셀렉트 주석과 같다(RHF는 렌더되지 않은 defaultValues도 그대로 들고 있다).
 */
const ROSTER_PROFILE_FIELD_SITES: readonly SiteSlug[] = ["celebrate-agency"];

export function hasRosterProfileFields(site: SiteSlug): boolean {
  return ROSTER_PROFILE_FIELD_SITES.includes(site);
}

/**
 * 범위 밖 뮤테이션 차단(서버 액션용). 라우트 가드는 화면을 막을 뿐 Server Action은
 * 그 자체가 엔드포인트라 여전히 호출된다 — 배포 직전에 열어둔 탭이나 라우터 캐시에
 * 남은 숨김 라우트가 제출하면, 이제 admin이 보여주지 않는 사이트에 행이 생기거나
 * 바뀐다(공개 앱도 그 엔티티를 렌더하지 않으니 아무도 못 보는 유령 행이 된다).
 * 세 actions.ts가 이미 하는 `siteSlugSchema.parse(신뢰 경계 재검증)` 바로 옆에서,
 * 같은 이유로 범위도 재검증한다.
 *
 * throw로 알리는 이유: 액션들이 전부 try/catch + toErrorMessage로 감싸고 있어
 * 던진 메시지가 그대로 편집자에게 닿는다. 정상 흐름에선 도달할 수 없는 경로라
 * 필드 귀속(field) 없이 폼 전역 오류로 충분하다.
 */
export function assertSiteCategory(
  site: SiteSlug,
  segment: CategorySegment
): void {
  if (hasSiteCategory(site, segment)) return;
  const label = CATEGORIES.find((c) => c.segment === segment)?.label ?? segment;
  throw new Error(`${SITE_LABELS[site]}에서는 ${label}를 관리하지 않습니다.`);
}

/** 사이트별 앱 아이콘(스위처·대시보드 카드 표시용). 각 앱 icon.png를 64px webp로 리사이즈한 복사본. */
export const SITE_ICONS: Record<SiteSlug, StaticImageData> = {
  "vague-frequency-labs": vagueFrequencyLabsIcon,
  "payday-records": paydayRecordsIcon,
  "celebrate-agency": celebrateAgencyIcon,
  juntaro: juntaroIcon,
};

/** 임의 문자열이 유효한 사이트 슬러그인지 좁힘(라우트 site 파라미터 검증용). */
export function isSiteSlug(value: string): value is SiteSlug {
  return (SITE_SLUGS as readonly string[]).includes(value);
}
