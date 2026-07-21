/**
 * CMS 시드 스크립트 (P4) — 하드코딩 소스 → Supabase.
 *
 * 실행:  pnpm seed:cms [--dry-run] [--cleanup-test]
 *   --dry-run        DB·Storage 접근 없이 변환 결과(행 수·slug·경로·검수 목록)만 stdout.
 *   --cleanup-test   시드 없이 VFL slug='test' 테스트 행 + 이미지만 정리하고 종료.
 *   (기본)           테스트 행 정리 → 이미지 업로드 → 멱등 upsert.
 *
 * 설계 규칙(cms-plan §10·§13):
 *   - 병합 없음: 각 앱 데이터는 해당 사이트 소속 행으로만 시드한다.
 *   - VFL 아티스트 slug는 라우트 파라미터 원문(`[artistName]` = artist.name)을 그대로 —
 *     기존 URL·SEO 보존을 위해 slugify 금지. 다른 엔티티/사이트는 slugify(또는 소스 id).
 *   - juntaro TOUR_DATES는 시드 데모 데이터(PR #221 연출용, 실제 공연 이력 아님).
 *   - EN/KO 혼합 설명은 문단 단위 휴리스틱(한글 포함 문단→ko, 그 외→en)으로 best-effort
 *     분리하되, 이중언어 자동 분리 건은 "검수 필요"로 남긴다.
 *   - 멱등: upsert(onConflict "site_slug,slug"), 이미지는 콘텐츠 해시 경로 upsert.
 *
 * ⚠️ 시드는 사실상 1회성이다 — admin에서 수기 편집(카피 교정·발매일 입력 등)을 시작한
 *    뒤 재실행하면 upsert가 행 전체를 소스값으로 되돌려 편집 내용이 소실된다.
 *    admin 편집 개시 후에는 재실행 금지(--cleanup-test·--dry-run은 무해).
 *
 * 러너: tsx (루트 devDependency). 앱 TS 소스와 packages/content 소스를 직접 import한다.
 * 서버 전용 모듈(sharp/service role)은 실행 경로에서만 dynamic import → --dry-run은
 * server-only 없이 구동된다.
 */

import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { SiteSlug, SocialPlatform } from "../packages/content/src/schema";
import type { Database } from "../packages/content/src/supabase/database.types";

// 소스 데이터 (하드코딩 원본)
import {
  artistProfilesData,
  musicInfoDatas,
} from "../apps/vague-frequency-labs/src/source";
import { TRACKS } from "../apps/juntaro/src/consts/tracks";
import { TOUR_DATES } from "../apps/juntaro/src/consts/tours";
import { releases as paydayReleases } from "../apps/payday-records/src/app/sections/release/config";
import { ARTISTS as celebrateArtists } from "../apps/celebrate-agency/src/consts/artists";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MEDIA_BUCKET = "media";

type ArtistInsert = Database["public"]["Tables"]["artists"]["Insert"];
type ReleaseInsert = Database["public"]["Tables"]["releases"]["Insert"];
type TourInsert = Database["public"]["Tables"]["tours"]["Insert"];

/** 각 사이트의 /public 루트(이미지 원본 위치). */
const SITE_PUBLIC: Record<SiteSlug, string> = {
  "vague-frequency-labs": resolve(ROOT, "apps/vague-frequency-labs/public"),
  "payday-records": resolve(ROOT, "apps/payday-records/public"),
  "celebrate-agency": resolve(ROOT, "apps/celebrate-agency/public"),
  juntaro: resolve(ROOT, "apps/juntaro/public"),
};

// ─────────────────────────────────────────────────────────────────────────
// 리포트 수집기
// ─────────────────────────────────────────────────────────────────────────
const review = {
  enKo: [] as string[], // 이중언어 자동 분리(수작업 검수 권장)
  placeholder: [] as string[], // "test"/"King" 등 빈약한 소스 값
  socials: [] as string[], // platform enum 매핑 불가
  missingImage: [] as string[], // 참조 이미지 파일 부재
};

// ─────────────────────────────────────────────────────────────────────────
// 변환 헬퍼
// ─────────────────────────────────────────────────────────────────────────

/** 소문자·하이픈 slug. 비VFL 엔티티/사이트에 적용(VFL 아티스트는 원문 유지). */
function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** 사이트 내 slug 유니크 보장 — 충돌 시 -2, -3… 서픽스. */
function makeUniqueSlug(base: string, seen: Set<string>): string {
  let slug = base;
  let n = 2;
  while (seen.has(slug)) slug = `${base}-${n++}`;
  seen.add(slug);
  return slug;
}

const PLACEHOLDER_VALUES = new Set(["test", "king", ""]);
function isPlaceholder(v?: string | null): boolean {
  return !v || PLACEHOLDER_VALUES.has(v.trim().toLowerCase());
}

/**
 * EN/KO 혼합 문자열을 문단(빈 줄) 단위로 분리. 한글 포함 문단→ko, 그 외→en.
 * 두 언어가 모두 존재하면 자동 분리가 휴리스틱이므로 검수 목록에 남긴다.
 */
function splitEnKo(raw: string | undefined, label: string): {
  en: string | null;
  ko: string | null;
} {
  const text = (raw ?? "").trim();
  if (!text) return { en: null, ko: null };
  if (isPlaceholder(text)) {
    review.placeholder.push(`${label}: "${text}"`);
    return { en: text, ko: null };
  }

  const paras = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/[ \t]+\n/g, "\n").trim())
    .filter(Boolean);
  const hasHangul = (s: string) => /[가-힣]/.test(s);

  const enParas: string[] = [];
  const koParas: string[] = [];
  for (const p of paras) (hasHangul(p) ? koParas : enParas).push(p);

  const en = enParas.join("\n\n") || null;
  const ko = koParas.join("\n\n") || null;

  if (en && ko) review.enKo.push(label); // 이중언어 → 검수 권장
  return { en, ko };
}

/** VFL socials iconName → SocialPlatform enum. */
const ICON_TO_PLATFORM: Record<string, SocialPlatform> = {
  SiYoutube: "youtube",
  SiInstagram: "instagram",
  SiSoundcloud: "soundcloud",
  SiSpotify: "spotify",
  SiApple: "appleMusic",
  SiBeatport: "beatport",
};

type SocialOut = { platform: SocialPlatform; url: string; label?: string };

/** VFL {name, href, iconName} socials → enum socials. 매핑 불가 항목은 검수 목록. */
function mapVflSocials(
  socials: { name: string; href: string; iconName?: string }[] | undefined,
  label: string,
): SocialOut[] {
  const out: SocialOut[] = [];
  for (const s of socials ?? []) {
    const platform = s.iconName ? ICON_TO_PLATFORM[s.iconName] : undefined;
    if (!platform) {
      review.socials.push(`${label}: ${s.name} (${s.iconName ?? "no-icon"})`);
      continue;
    }
    out.push({ platform, url: s.href });
  }
  return out;
}

const CELEBRATE_PLATFORMS = new Set<SocialPlatform>([
  "instagram",
  "youtube",
  "soundcloud",
  "spotify",
  "beatport",
  "appleMusic",
  "youtubeMusic",
  "bandcamp",
  "tiktok",
  "x",
  "website",
]);

/** celebrate socials(platform 문자열)를 enum으로 검증. `etc` 등 매핑 불가→website 폴백+검수. */
function mapCelebrateSocials(
  socials: { platform: string; url: string; label?: string }[],
  label: string,
): SocialOut[] {
  const out: SocialOut[] = [];
  for (const s of socials) {
    if (CELEBRATE_PLATFORMS.has(s.platform as SocialPlatform)) {
      out.push({ platform: s.platform as SocialPlatform, url: s.url, ...(s.label ? { label: s.label } : {}) });
    } else {
      review.socials.push(`${label}: platform="${s.platform}" → website 폴백`);
      out.push({ platform: "website", url: s.url });
    }
  }
  return out;
}

type PlatformLinks = Record<string, string>;
const STREAMING_KEYS = new Set([
  "beatport",
  "spotify",
  "appleMusic",
  "soundcloud",
  "youtubeMusic",
]);

/** 정규화된 {key,url} 목록을 platform_links(5키)와 나머지 socials로 분류. */
function classifyLinks(
  items: { key: string; url: string }[],
): { links: PlatformLinks; socials: SocialOut[] } {
  const links: PlatformLinks = {};
  const socials: SocialOut[] = [];
  for (const { key, url } of items) {
    if (STREAMING_KEYS.has(key)) {
      if (!links[key]) links[key] = url;
    } else if (key === "youtube") {
      socials.push({ platform: "youtube", url });
    }
  }
  return { links, socials };
}

const MONTHS: Record<string, string> = {
  JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
  JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12",
};

/**
 * TOUR_DATES의 dateLabel("MAR 14") + year("2026") → event_date timestamptz.
 * 소스에 시간이 없어 door/공연 시간대를 KST 20:00으로 임의 지정(데모 데이터).
 * 반환: { iso, ymd } — ymd는 slug 합성용 "YYYY-MM-DD".
 */
function parseTourDate(dateLabel: string, year: string): { iso: string; ymd: string } {
  const [mon, day] = dateLabel.trim().split(/\s+/);
  const mm = MONTHS[mon.toUpperCase()];
  if (!mm) throw new Error(`알 수 없는 월: ${dateLabel}`);
  const dd = day.padStart(2, "0");
  const ymd = `${year}-${mm}-${dd}`;
  return { iso: `${ymd}T20:00:00+09:00`, ymd };
}

// ─────────────────────────────────────────────────────────────────────────
// 이미지 참조: 소스 /public 상대경로 → { site, absPath, storage kind }
// ─────────────────────────────────────────────────────────────────────────
interface ImageRef {
  /** artist | release | tour */
  entity: string;
  /** profile | logo | artwork | poster */
  kind: string;
  site: SiteSlug;
  slug: string;
  /** 소스 /public 상대경로 (예: /images/artist/juntaro/profile.webp) */
  publicPath: string;
  /** 파일시스템 절대경로 */
  abs: string;
  exists: boolean;
}

function imageRef(
  entity: string,
  kind: string,
  site: SiteSlug,
  slug: string,
  publicPath: string | undefined | null,
  label: string,
): ImageRef | null {
  if (!publicPath) return null;
  const abs = resolve(SITE_PUBLIC[site], publicPath.replace(/^\//, ""));
  const exists = existsSync(abs);
  if (!exists) review.missingImage.push(`${label}: ${publicPath}`);
  return { entity, kind, site, slug, publicPath, abs, exists };
}

// ─────────────────────────────────────────────────────────────────────────
// 엔티티 시드 빌드 (순수 변환)
// ─────────────────────────────────────────────────────────────────────────
interface SeedRow<T> {
  insert: T;
  images: ImageRef[];
  /** release/tour의 아티스트 참조 "site:slug" (real 실행에서 uuid로 해석). */
  artistRef?: string | null;
}

const VFL: SiteSlug = "vague-frequency-labs";
const PAYDAY: SiteSlug = "payday-records";
const CELEBRATE: SiteSlug = "celebrate-agency";
const JUNTARO: SiteSlug = "juntaro";

function buildArtists(): SeedRow<ArtistInsert>[] {
  const rows: SeedRow<ArtistInsert>[] = [];

  // VFL 아티스트 6명 — slug = 라우트 파라미터 원문(artist.name), slugify 금지.
  artistProfilesData.forEach((a, i) => {
    const slug = a.name; // 원문 보존 (Juntaro/SAM/DearBoi/PLAYMODE/…)
    const label = `artist[vfl:${slug}]`;
    const full = splitEnKo(a.fullDescription, `${label}.fullDescription`);
    const short = splitEnKo(a.shortDescription, `${label}.shortDescription`);
    rows.push({
      insert: {
        site_slug: VFL,
        slug,
        name: a.name,
        nickname: a.nickname ?? null,
        short_description_en: short.en,
        short_description_ko: short.ko,
        full_description_en: full.en,
        full_description_ko: full.ko,
        city: null,
        selected_works: [],
        socials: mapVflSocials(a.socials, label),
        sort_order: i,
      },
      images: [
        imageRef("artist", "profile", VFL, slug, a.image, label),
        imageRef("artist", "logo", VFL, slug, a.logoImage, label),
      ].filter((x): x is ImageRef => x !== null),
    });
  });

  // celebrate roster 전원 — 별도 행(VFL과 겹쳐도 병합 안 함). slug = 소스 id(이미 slug형).
  celebrateArtists.forEach((a, i) => {
    const slug = slugify(a.id);
    const label = `artist[celebrate:${slug}]`;
    if (isPlaceholder(a.bio)) review.placeholder.push(`${label}.bio: "${a.bio}"`);
    rows.push({
      insert: {
        site_slug: CELEBRATE,
        slug,
        name: a.name,
        nickname: null,
        // celebrate bio는 영문 단일 → en. (Coming Soon. 등 placeholder 포함)
        short_description_en: null,
        short_description_ko: null,
        full_description_en: a.bio ?? null,
        full_description_ko: null,
        city: a.city ?? null,
        // selected_works: 소스 {id,title,meta} → 스키마 {title, meta?} (id 폐기)
        selected_works: a.selectedWorks.map((w) => ({ title: w.title, meta: w.meta })),
        socials: mapCelebrateSocials(a.socials, label),
        sort_order: i,
      },
      images: [
        imageRef("artist", "profile", CELEBRATE, slug, a.image, label),
      ].filter((x): x is ImageRef => x !== null),
    });
  });

  return rows;
}

function buildReleases(): SeedRow<ReleaseInsert>[] {
  const rows: SeedRow<ReleaseInsert>[] = [];
  const vflSeen = new Set<string>();
  const paydaySeen = new Set<string>();
  const juntaroSeen = new Set<string>();

  // VFL MusicInfo 5곡 → releases(vfl). primary_artist_id는 같은 사이트 아티스트명 매칭.
  const vflArtistSlugs = new Set(artistProfilesData.map((a) => a.name));
  musicInfoDatas.forEach((m, i) => {
    const slug = makeUniqueSlug(slugify(m.name), vflSeen);
    const label = `release[vfl:${slug}]`;
    const short = splitEnKo(m.shortDescription, `${label}.shortDescription`);
    const full = splitEnKo(m.fullDescription, `${label}.fullDescription`);
    const norm = mapVflSocials(m.socials, label).map((s) => ({
      key: s.platform as string,
      url: s.url,
    }));
    const { links, socials } = classifyLinks(norm);
    const artistRef = vflArtistSlugs.has(m.artist) ? `${VFL}:${m.artist}` : null;
    rows.push({
      insert: {
        site_slug: VFL,
        slug,
        title: m.name,
        artist_credit: m.artist,
        featured_artists: [],
        label: m.label ?? null,
        catalog_no: null,
        short_description_en: short.en,
        short_description_ko: short.ko,
        full_description_en: full.en,
        full_description_ko: full.ko,
        release_date: null,
        platform_links: links,
        socials,
        sort_order: i,
      },
      images: [imageRef("release", "artwork", VFL, slug, m.image, label)].filter(
        (x): x is ImageRef => x !== null,
      ),
      artistRef,
    });
  });

  // payday Release 1곡 → releases(payday). 외부 아티스트("Sam Collins")는 artist_credit만.
  paydayReleases.forEach((r, i) => {
    const slug = makeUniqueSlug(slugify(r.title), paydaySeen);
    const label = `release[payday:${slug}]`;
    const links: PlatformLinks = {};
    for (const [k, url] of Object.entries(r.links)) {
      if (url && STREAMING_KEYS.has(k)) links[k] = url;
    }
    rows.push({
      insert: {
        site_slug: PAYDAY,
        slug,
        title: r.title,
        artist_credit: r.artist,
        featured_artists: [],
        label: r.label ?? null,
        catalog_no: r.catalogNo ?? null,
        release_date: null,
        platform_links: links,
        socials: [],
        sort_order: i,
      },
      images: [imageRef("release", "artwork", PAYDAY, slug, r.artwork, label)].filter(
        (x): x is ImageRef => x !== null,
      ),
      artistRef: null,
    });
  });

  // juntaro TRACKS 15곡 → releases(juntaro). slug = 소스 id(이미 slug형). 링크→platform_links.
  TRACKS.forEach((t, i) => {
    const slug = makeUniqueSlug(slugify(t.id), juntaroSeen);
    const label = `release[juntaro:${slug}]`;
    const norm = t.links.map((l) => ({ key: trackPlatformKey(l.platform), url: l.href }));
    const { links, socials } = classifyLinks(norm);
    rows.push({
      insert: {
        site_slug: JUNTARO,
        slug,
        title: t.name,
        artist_credit: t.artist ?? "Juntaro",
        featured_artists: [],
        label: null,
        catalog_no: null,
        // shortDescription = "장르 · Single · 연도" 영문 메타
        short_description_en: t.shortDescription ?? null,
        short_description_ko: null,
        release_date: null,
        platform_links: links,
        socials,
        sort_order: i,
      },
      images: [imageRef("release", "artwork", JUNTARO, slug, t.cover, label)].filter(
        (x): x is ImageRef => x !== null,
      ),
      artistRef: null, // juntaro 사이트 아티스트는 시드 범위 밖
    });
  });

  return rows;
}

/** juntaro TrackLink.platform("Spotify"/"Apple Music"/"Beatport") → platform_links 키. */
function trackPlatformKey(platform: string): string {
  const p = platform.toLowerCase();
  if (p.includes("apple")) return "appleMusic";
  if (p.includes("spotify")) return "spotify";
  if (p.includes("beatport")) return "beatport";
  if (p.includes("soundcloud")) return "soundcloud";
  if (p.includes("youtube")) return "youtube";
  return slugify(platform);
}

function buildTours(): SeedRow<TourInsert>[] {
  const rows: SeedRow<TourInsert>[] = [];
  const seen = new Set<string>();

  // juntaro TOUR_DATES 8건 → tours(juntaro). 시드 데모 데이터(PR #221 연출용).
  TOUR_DATES.forEach((d, i) => {
    const { iso, ymd } = parseTourDate(d.dateLabel, d.year);
    const slug = makeUniqueSlug(slugify(`${d.city}-${ymd}`), seen);
    rows.push({
      insert: {
        site_slug: JUNTARO,
        slug,
        title: `${d.venue} — ${d.city}`, // "{venue} — {city}"
        artist_id: null, // juntaro 사이트 아티스트 미시드
        venue: d.venue,
        city: d.city,
        country: d.country,
        event_date: iso,
        // status는 저장값 scheduled 고정 — 과거 여부는 event_date로 유도(§13).
        status: "scheduled",
        sort_order: i,
      },
      images: [],
    });
  });

  return rows;
}

// ─────────────────────────────────────────────────────────────────────────
// 리포트 출력
// ─────────────────────────────────────────────────────────────────────────
function printReport(
  artists: SeedRow<ArtistInsert>[],
  releases: SeedRow<ReleaseInsert>[],
  tours: SeedRow<TourInsert>[],
  dryRun: boolean,
) {
  const bySite = <T extends { insert: { site_slug: string } }>(rows: T[]) => {
    const m: Record<string, number> = {};
    for (const r of rows) m[r.insert.site_slug] = (m[r.insert.site_slug] ?? 0) + 1;
    return m;
  };

  const line = "─".repeat(72);
  console.log(`\n${line}`);
  console.log(dryRun ? "CMS 시드 — DRY RUN (DB·Storage 미접근)" : "CMS 시드 결과");
  console.log(line);

  console.log(`\n[행 수]`);
  console.log(`  artists  : ${artists.length}  ${JSON.stringify(bySite(artists))}`);
  console.log(`  releases : ${releases.length}  ${JSON.stringify(bySite(releases))}`);
  console.log(`  tours    : ${tours.length}  ${JSON.stringify(bySite(tours))}`);

  const totalImages =
    artists.reduce((n, r) => n + r.images.length, 0) +
    releases.reduce((n, r) => n + r.images.length, 0) +
    tours.reduce((n, r) => n + r.images.length, 0);
  const foundImages =
    artists.reduce((n, r) => n + r.images.filter((i) => i.exists).length, 0) +
    releases.reduce((n, r) => n + r.images.filter((i) => i.exists).length, 0) +
    tours.reduce((n, r) => n + r.images.filter((i) => i.exists).length, 0);
  console.log(`  images   : ${foundImages}/${totalImages} 파일 존재 (Storage 업로드 대상)`);

  console.log(`\n[slug 목록]`);
  const printSlugs = (title: string, rows: SeedRow<{ site_slug: string; slug: string }>[]) => {
    console.log(`  ${title}:`);
    for (const r of rows) {
      const ref = r.artistRef ? `  → artist ${r.artistRef}` : "";
      console.log(`    ${r.insert.site_slug.padEnd(20)} ${r.insert.slug}${ref}`);
    }
  };
  printSlugs("artists (VFL slug 원문 유지 확인)", artists);
  printSlugs("releases", releases);
  printSlugs("tours", tours);

  console.log(`\n[검수 필요 — EN/KO 자동 분리(이중언어)]  ${review.enKo.length}건`);
  review.enKo.forEach((s) => console.log(`    - ${s}`));
  console.log(`\n[검수 필요 — socials 매핑]  ${review.socials.length}건`);
  review.socials.forEach((s) => console.log(`    - ${s}`));
  console.log(`\n[참고 — placeholder/빈약 소스 값]  ${review.placeholder.length}건`);
  review.placeholder.forEach((s) => console.log(`    - ${s}`));
  console.log(`\n[경고 — 이미지 파일 부재]  ${review.missingImage.length}건`);
  review.missingImage.forEach((s) => console.log(`    - ${s}`));

  console.log(`\n[Storage 경로 규칙]`);
  console.log(`    {entity}/{site}/{slug}/{kind}-{hash8}.webp  (hash = sha256(webp)[:8])`);
  console.log(line + "\n");
}

// ─────────────────────────────────────────────────────────────────────────
// 실 실행 (DB·Storage)
// ─────────────────────────────────────────────────────────────────────────

/** apps/admin/.env.local → 루트 .env 순으로 env 로드(먼저 정의된 값 우선). */
function loadEnv() {
  const files = [resolve(ROOT, "apps/admin/.env.local"), resolve(ROOT, ".env")];
  for (const f of files) {
    if (!existsSync(f)) continue;
    for (const raw of readFileSync(f, "utf8").split("\n")) {
      const m = raw.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      let val = m[2];
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      )
        val = val.slice(1, -1);
      if (process.env[m[1]] === undefined) process.env[m[1]] = val;
    }
  }
}

type Supabase = import("@supabase/supabase-js").SupabaseClient<Database>;

/** toWebp 재처리 → 콘텐츠 해시 경로로 media 버킷 upsert (entity-media.ts와 동형). */
async function uploadImage(
  supabase: Supabase,
  toWebp: (b: Buffer) => Promise<{ webp: Buffer; placeholder: string }>,
  ref: ImageRef,
): Promise<{ path: string; placeholder: string } | null> {
  if (!ref.exists) return null;
  const input = readFileSync(ref.abs);
  const { webp, placeholder } = await toWebp(input);
  const hash = createHash("sha256").update(webp).digest("hex").slice(0, 8);
  const path = `${ref.entity}/${ref.site}/${ref.slug}/${ref.kind}-${hash}.webp`;
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, webp, { contentType: "image/webp", upsert: true });
  if (error) throw new Error(`이미지 업로드 실패(${path}): ${error.message}`);
  return { path, placeholder };
}

/** VFL slug='test' 테스트 행 + 그 Storage 이미지 정리. */
async function cleanupTestRow(supabase: Supabase): Promise<number> {
  const { data, error } = await supabase
    .from("artists")
    .select("id, image_path, logo_image_path")
    .eq("site_slug", VFL)
    .eq("slug", "test");
  if (error) throw new Error(`테스트 행 조회 실패: ${error.message}`);
  if (!data?.length) return 0;
  const paths = data
    .flatMap((r) => [r.image_path, r.logo_image_path])
    .filter((p): p is string => Boolean(p));
  if (paths.length) await supabase.storage.from(MEDIA_BUCKET).remove(paths);
  const { error: delErr } = await supabase
    .from("artists")
    .delete()
    .eq("site_slug", VFL)
    .eq("slug", "test");
  if (delErr) throw new Error(`테스트 행 삭제 실패: ${delErr.message}`);
  return data.length;
}

async function runSeed(
  artists: SeedRow<ArtistInsert>[],
  releases: SeedRow<ReleaseInsert>[],
  tours: SeedRow<TourInsert>[],
) {
  loadEnv();
  const { createServiceClient } = await import(
    "../packages/content/src/supabase/service"
  );
  const { toWebp } = await import("../packages/content/src/image/to-webp");
  const supabase = createServiceClient() as Supabase;

  console.log("· 테스트 행 정리…");
  const removed = await cleanupTestRow(supabase);
  console.log(`  제거: ${removed}행`);

  // 아티스트: 이미지 업로드 → 컬럼 채워 upsert → id 맵.
  console.log("· 아티스트 이미지 업로드 + upsert…");
  for (const r of artists) {
    for (const img of r.images) {
      const up = await uploadImage(supabase, toWebp, img);
      if (!up) continue;
      if (img.kind === "profile") {
        r.insert.image_path = up.path;
        r.insert.image_placeholder = up.placeholder;
      } else if (img.kind === "logo") {
        r.insert.logo_image_path = up.path;
      }
    }
  }
  const { data: artistRows, error: aErr } = await supabase
    .from("artists")
    .upsert(
      artists.map((r) => r.insert),
      { onConflict: "site_slug,slug" },
    )
    .select("id, site_slug, slug");
  if (aErr) throw new Error(`artists upsert 실패: ${aErr.message}`);
  const idMap = new Map<string, string>();
  for (const row of artistRows ?? []) idMap.set(`${row.site_slug}:${row.slug}`, row.id);

  // 릴리즈: artistRef → uuid, 이미지 업로드 → upsert.
  console.log("· 릴리즈 이미지 업로드 + upsert…");
  for (const r of releases) {
    r.insert.primary_artist_id = r.artistRef ? (idMap.get(r.artistRef) ?? null) : null;
    for (const img of r.images) {
      const up = await uploadImage(supabase, toWebp, img);
      if (!up) continue;
      r.insert.artwork_path = up.path;
      r.insert.artwork_placeholder = up.placeholder;
    }
  }
  const { error: rErr } = await supabase
    .from("releases")
    .upsert(
      releases.map((r) => r.insert),
      { onConflict: "site_slug,slug" },
    );
  if (rErr) throw new Error(`releases upsert 실패: ${rErr.message}`);

  // 투어: 소스 이미지 없음 → 행만 upsert.
  console.log("· 투어 upsert…");
  const { error: tErr } = await supabase
    .from("tours")
    .upsert(
      tours.map((r) => r.insert),
      { onConflict: "site_slug,slug" },
    );
  if (tErr) throw new Error(`tours upsert 실패: ${tErr.message}`);

  console.log("· 완료.");
}

// ─────────────────────────────────────────────────────────────────────────
// main
// ─────────────────────────────────────────────────────────────────────────
async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has("--dry-run");
  const cleanupOnly = args.has("--cleanup-test");

  if (cleanupOnly && !dryRun) {
    loadEnv();
    const { createServiceClient } = await import(
      "../packages/content/src/supabase/service"
    );
    const supabase = createServiceClient() as Supabase;
    const removed = await cleanupTestRow(supabase);
    console.log(`테스트 행 정리 완료: ${removed}행 제거.`);
    return;
  }

  const artists = buildArtists();
  const releases = buildReleases();
  const tours = buildTours();

  printReport(artists, releases, tours, dryRun);

  if (dryRun) {
    console.log("dry-run — DB 변경 없음. 실 시드는 env(서비스 키) 준비 후 --dry-run 없이 실행.");
    return;
  }

  await runSeed(artists, releases, tours);
}

main().catch((err) => {
  console.error("\n시드 실패:", err instanceof Error ? err.message : err);
  process.exit(1);
});
