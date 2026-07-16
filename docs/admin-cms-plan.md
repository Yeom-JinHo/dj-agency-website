# Admin CMS 설계 계획 — Music / Artist / Tour

4개 사이트(`vague-frequency-labs`, `payday-records`, `celebrate-agency`, `juntaro`)가
공유하는 **단일 콘텐츠 소스 + 편집용 Admin**을 구축하기 위한 상세 설계 문서.

> 상태: **설계 확정, 구현 대기.** 이 문서는 구현 전 합의된 청사진이다.

---

## 1. 목표 & 배경

### 목표
- Music / Artist / Tour 정보를 **한 곳에서 관리**하고 4개 사이트가 공유한다.
- 각 사이트는 정적 사이트 수준의 속도·비용을 유지한다(마케팅 사이트).
- 이미지 규약(webp ≤1MB)을 자동으로 지킨다.

### 현재 상태 (조사 결과)
- **모노레포**: Turborepo + pnpm, Next.js 15.5 / React 19, 배포 Vercel.
- **데이터는 전부 하드코딩**: 각 앱의 `source.ts` / `sections/*/config.ts`에 TS 객체로 존재.
  DB·CMS·API 없음.
- **엔티티가 앱마다 제각각**:
  - `ArtistProfile` (VFL) — 사이트 간 공유되는 아티스트(Juntaro는 별도 앱까지 존재).
  - `MusicInfo` (VFL) vs `Release` (payday) — 음원 타입이 앱마다 미묘하게 다름.
  - `Tour` — **아직 없음. 신규 설계 대상.**
- **이미지 규약**(`CLAUDE.md`): webp만, ≤1MB, sharp로 변환 후 원본 삭제.

### 핵심 과제
1. 사이트 간 공유되는 **단일 스키마**로 타입 통일.
2. 편집 → 저장 → 사이트 반영까지 **저비용·자동** 파이프라인.
3. 이미지 업로드 시 자동 webp 변환.

---

## 2. 확정된 기술 스택 & 결정사항

| 항목 | 결정 | 비고 |
|---|---|---|
| 백엔드 | **Supabase** (Postgres + Auth + Storage) | 무료 티어 시작, SaaS 비용 회피 |
| Admin | `apps/admin` (Next.js, 포트 3006), **Vercel 배포** | UI는 **shadcn/ui + Tailwind v4로 직접 구축** |
| 사이트 소비 | **ISR + on-demand 웹훅 revalidate** | 시간 기반 revalidate 미사용 |
| 이미지 | 업로드 시 **sharp → webp(≤1MB)** 변환 후 Storage 저장 | 런타임 변환(유료) 미사용 |
| 콜라보 모델 | `primary_artist_id` + `featured_artists text[]` (v1) | 필요 시 조인 테이블로 승격 |
| 다국어 | `*_en` / `*_ko` **필드 분리** | admin에서 언어별 편집 |

### 왜 이 조합인가 (요약)
- **Supabase(순수)**: 웹훅(Database Webhooks)·webp(업로드 변환)·Auth·Storage를 전부 무료로 확보.
  런타임 이미지 변환만 유료인데 우리는 업로드 시점 변환이라 해당 없음.
- **커스텀 admin**: UI를 직접 만들되(shadcn), 그 아래 토대(스키마/타입/클라이언트/파이프라인)는 공용 패키지로 제공.
- **ISR on-demand**: 콘텐츠가 자주 안 바뀌므로 "저장 순간에만" 재생성 → 비용 사실상 0.

---

## 3. 비용 분석 (Vercel ISR)

**결론: ISR 때문에 과금 폭탄이 날 구조가 아니다.**

Vercel은 ISR을 `reads`(캐시 서빙, 매우 쌈)와 `writes`(페이지 재생성)로 과금한다.
비용은 **재생성 빈도**가 결정한다.

| 방식 | 재생성 빈도 | 비용 |
|---|---|---|
| ❌ 시간 기반 `revalidate: 60` | 트래픽마다 계속 | write 폭증 |
| ✅ **on-demand(웹훅)** | 편집자 저장 시에만 | write ~ 하루 수 건 |

- 우리는 on-demand 방식 → **write 최소**, 나머지 트래픽은 전부 CDN 캐시(read).
- 실제 비용 요인은 ISR이 아니라 ① 이미지 최적화 ② 대역폭 ③ 함수 호출인데,
  webp 저장 + 정적 캐시 설계로 셋 다 회피.
- **Hobby(무료)**로도 이 트래픽이면 대체로 커버. 단 Hobby는 비상업용만 허용 →
  에이전시 사이트는 약관상 **Pro($20/월, 팀 단위·4개 사이트 통합)** 권장. 그 안에서 안정적.
- Vercel을 벗어나고 싶으면 Cloudflare Pages / Netlify / 셀프호스트로 이전하고
  Supabase는 그대로 사용 가능(향후 옵션).

---

## 4. 아키텍처 & 데이터 흐름

### 4.1 전체 그림

```
편집자 ─(수정)→ [apps/admin] ─→ [Supabase DB] ─(webhook)→ [오케스트레이터] ─(fan-out)→ 각 사이트 revalidateTag
                                                                                              │
방문자 ─→ [Vercel CDN 캐시] ──(HIT: 대부분)─────────────────────────────────────────→ 정적 HTML
                └──(MISS: 무효화 직후 1회)──→ 서버 렌더 → Supabase 조회 → 캐시 저장
```

### 4.2 읽기 경로 (방문자)

```
방문자 → [Vercel CDN 캐시]
   캐시 HIT (대부분) ──→ 정적 HTML 즉시 반환 (Supabase 조회 X)
   캐시 MISS ─────────→ 서버 컴포넌트 → @repo/content 조회 → Supabase fetch → HTML 생성 → 캐시 저장
```

조회 함수는 **태그**를 달아 캐시한다:

```ts
export const getArtist = (slug: string) =>
  unstable_cache(
    () => fetchArtistFromSupabase(slug),
    ["artist", slug],
    { tags: [`artist:${slug}`, "artists"] } // ← 무효화 키
  )();
```

### 4.3 쓰기 경로 (편집자) — 핵심

예시: 편집자가 Juntaro 프로필을 수정·저장.

```
1. [apps/admin] 폼 저장 (shadcn Form) → server action
2. [server action] zod 검증 → supabase.from('artists').update(...)
3. [Supabase Postgres] UPDATE 커밋 → Database Webhook 발동
4. [오케스트레이터 Edge Function]
      · 바뀐 엔티티: artist / slug=juntaro
      · artist_sites 조인으로 노출 사이트 조회 → [vague-frequency-labs, juntaro]
      · 해당 사이트에만 fan-out
5. [각 사이트 POST /api/revalidate] (시크릿 헤더 검증)
      · revalidateTag(`artist:juntaro`)
      · revalidateTag(`artists`)  // 목록도 갱신
6. 해당 태그 캐시만 무효화
7. 다음 방문자 요청 시 캐시 MISS 경로로 1회 재생성 → 새 내용 반영
```

**비용 발생은 6→7뿐이며, 저장한 그 순간·영향받은 태그만.**

#### 오케스트레이터를 두는 이유
Supabase Database Webhook은 **URL 하나**로만 쏜다. 사이트는 4개이므로:
- **(권장)** Edge Function 1개가 받아 → 노출 사이트 조인 조회 → 필요한 사이트만 fan-out.
- **(무코드 대안)** 웹훅 4개를 만들어 4개 사이트에 broadcast. `revalidateTag`는
  해당 태그를 안 쓰는 사이트에선 no-op이라 안전하지만 매번 4개를 두드림.

### 4.4 이미지 업로드 경로

```
1. [apps/admin] 파일 선택 → server action 업로드
2. [toWebp()] sharp 변환: quality 80부터 ≤1MB까지 스텝 다운 + blurDataURL 생성
3. [Supabase Storage] .webp만 저장 (예: artist/juntaro/profile.webp)
4. [DB] image_path / image_placeholder 갱신
5. 이후 쓰기 경로(4.3)로 이어져 revalidate
```

런타임 변환 미사용 → 비용 0, `CLAUDE.md` 규약과 일치.

### 4.5 인증 경로

```
[apps/admin] 전체를 로그인 뒤로 (middleware 가드)
   미로그인 → /login 리다이렉트
   Supabase Auth (이메일/비번, 소수 편집자)

RLS 권한:
   anon (4개 사이트 읽기)        → SELECT 만 허용
   authenticated (admin)         → INSERT/UPDATE/DELETE 허용
   service_role                  → 서버 전용, 클라이언트 노출 금지
```

---

## 5. 모노레포 구조

```
apps/
  admin/                 ← 신규. UI는 직접 구축 (shadcn), 포트 3006, Vercel 배포
packages/
  content/               ← 신규. Admin·사이트가 공유하는 토대
    src/
      schema/            - zod 스키마 + TS 타입 (단일 정의, en/ko 포함)
      supabase/          - 클라이언트(browser/server/service/anon) + Database 타입
      image/             - toWebp 헬퍼 (sharp, server 전용)
      queries/           - getArtists/getReleases/getTours 등 조회 함수
supabase/
  migrations/            - SQL 마이그레이션 (스키마 + RLS + Storage)
  functions/             - revalidate 오케스트레이터 Edge Function (Phase 3)
```

- 각 사이트는 `@repo/content/queries`만 import해 소비.
- 기존에 앱마다 갈린 타입(`MusicInfo`/`Release`/`ArtistProfile`)은 `schema`로 통일.
- **server-only 모듈(sharp, service role)은 서브패스 export로 분리** → 클라이언트 번들 오염 방지
  (기존 `@repo/ui`의 서브패스 export 컨벤션과 동일).

### `packages/content` export 맵 (예정)

```jsonc
{
  "./schema":            "./src/schema/index.ts",       // 어디서나 안전
  "./supabase/client":   "./src/supabase/client.ts",    // 브라우저(admin client component)
  "./supabase/server":   "./src/supabase/server.ts",    // 서버(admin, 인증 세션)
  "./supabase/service":  "./src/supabase/service.ts",   // 서버 전용(service role)
  "./supabase/anon":     "./src/supabase/anon.ts",      // 사이트 공개 읽기
  "./supabase/types":    "./src/supabase/database.types.ts",
  "./image":             "./src/image/to-webp.ts",      // 서버 전용(sharp)
  "./queries":           "./src/queries/index.ts"
}
```

---

## 6. DB 스키마 (SQL)

핵심 설계: **엔티티↔사이트는 다대다**(아티스트가 여러 사이트에 노출) → 조인 테이블 분리.
다국어는 `*_en`/`*_ko`, 콜라보는 `featured_artists text[]`(v1).

```sql
-- 확장
create extension if not exists pgcrypto;

-- updated_at 자동 갱신
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

-- sites (4개 앱 참조 데이터)
create table public.sites (
  slug text primary key,
  name text not null
);
insert into public.sites (slug, name) values
  ('vague-frequency-labs', 'Vague Frequency Labs'),
  ('payday-records',       'Payday Records'),
  ('celebrate-agency',     'Celebrate Agency'),
  ('juntaro',              'Juntaro');

-- artists (사이트 공유)
create table public.artists (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text unique not null,
  name                 text not null,
  nickname             text,
  short_description_en text,
  short_description_ko text,
  full_description_en  text,
  full_description_ko  text,
  image_path           text,   -- Storage 경로 (.webp)
  logo_image_path      text,
  image_placeholder    text,   -- blurDataURL base64
  socials              jsonb not null default '[]'::jsonb,  -- [{name, href, iconName}]
  sort_order           int  not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create trigger artists_set_updated_at before update on public.artists
  for each row execute function public.set_updated_at();

-- releases (음원)
create table public.releases (
  id                   uuid primary key default gen_random_uuid(),
  slug                 text unique not null,
  title                text not null,
  primary_artist_id    uuid references public.artists(id) on delete set null,
  featured_artists     text[] not null default '{}',
  label                text,
  catalog_no           text,
  artwork_path         text,   -- .webp
  short_description_en text,
  short_description_ko text,
  full_description_en  text,
  full_description_ko  text,
  release_date         date,
  platform_links       jsonb not null default '{}'::jsonb, -- {beatport,spotify,appleMusic,soundcloud,youtubeMusic}
  socials              jsonb not null default '[]'::jsonb,
  sort_order           int  not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create trigger releases_set_updated_at before update on public.releases
  for each row execute function public.set_updated_at();

-- tours (신규 엔티티)
create table public.tours (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  artist_id      uuid references public.artists(id) on delete set null,
  venue          text,
  city           text,
  country        text,
  event_date     timestamptz not null,
  door_time      text,
  ticket_url     text,
  poster_path    text,   -- .webp
  description_en text,
  description_ko text,
  status         text not null default 'scheduled'
                   check (status in ('scheduled','soldout','cancelled','past')),
  sort_order     int  not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger tours_set_updated_at before update on public.tours
  for each row execute function public.set_updated_at();

-- 엔티티 ↔ 사이트 노출 (다대다)
create table public.artist_sites (
  artist_id uuid references public.artists(id) on delete cascade,
  site_slug text references public.sites(slug)  on delete cascade,
  primary key (artist_id, site_slug)
);
create table public.release_sites (
  release_id uuid references public.releases(id) on delete cascade,
  site_slug  text references public.sites(slug)   on delete cascade,
  primary key (release_id, site_slug)
);
create table public.tour_sites (
  tour_id   uuid references public.tours(id)  on delete cascade,
  site_slug text references public.sites(slug) on delete cascade,
  primary key (tour_id, site_slug)
);

-- 인덱스 (읽기 경로)
create index idx_artists_sort           on public.artists (sort_order);
create index idx_releases_primary_artist on public.releases (primary_artist_id);
create index idx_releases_sort           on public.releases (sort_order, release_date desc);
create index idx_tours_artist            on public.tours (artist_id);
create index idx_tours_event_date        on public.tours (event_date desc);
create index idx_artist_sites_site       on public.artist_sites (site_slug);
create index idx_release_sites_site      on public.release_sites (site_slug);
create index idx_tour_sites_site         on public.tour_sites (site_slug);
```

### RLS & Storage

```sql
-- 모든 테이블 RLS 활성화 → 공개 읽기 + authenticated 쓰기
-- (각 테이블에 대해)
--   create policy <t>_read  on public.<t> for select using (true);
--   create policy <t>_write on public.<t> for all to authenticated using (true) with check (true);

-- Storage: media 버킷 (public read, authenticated write)
insert into storage.buckets (id, name, public) values ('media','media',true);
create policy "media_public_read"        on storage.objects for select using (bucket_id = 'media');
create policy "media_authenticated_write" on storage.objects for all to authenticated
  using (bucket_id = 'media') with check (bucket_id = 'media');
```

> 실제 마이그레이션에서는 RLS 정책을 `do $$ ... $$` 루프로 7개 테이블에 일괄 생성한다.
> Storage 경로 규칙: `artist/{slug}/profile.webp`, `release/{slug}/artwork.webp`, `tour/{slug}/poster.webp`.

---

## 7. `packages/content` 상세

### 7.1 zod 스키마 (`schema/`)
- `social.ts` — `{ name, href, iconName }`
- `site.ts` — `SITE_SLUGS` 상수 + `SiteSlug` 타입
- `artist.ts` / `release.ts` / `tour.ts` — 각 엔티티의 zod 스키마 + `z.infer` 타입
- **admin 폼 검증과 사이트 렌더 타입을 이 한 곳에서 공유** (react-hook-form + zodResolver 재사용)

### 7.2 Supabase 클라이언트 (`supabase/`)
- `client.ts` — `createBrowserClient` (admin client component)
- `server.ts` — `createServerClient` + `next/headers` 쿠키 (admin 서버, 인증 세션)
- `service.ts` — `createClient` + service role (서버 전용 특권 작업)
- `anon.ts` — `createClient` + anon, 세션 미영속 (사이트 공개 읽기)
- `database.types.ts` — 손으로 작성 후 `supabase gen types typescript`로 재생성 가능

### 7.3 이미지 (`image/to-webp.ts`, 서버 전용)
```ts
// quality 80부터 시작해 ≤1MB 될 때까지 낮춤 + blurDataURL 생성
export async function toWebp(input: Buffer): Promise<{ webp: Buffer; placeholder: string }> { ... }
```

### 7.4 조회 함수 (`queries/`)
- `getArtists(siteSlug?)`, `getArtistBySlug(slug)`
- `getReleases(siteSlug?)`, `getReleaseBySlug(slug)`
- `getTours(siteSlug?)`
- 사이트 노출은 `*_sites` 조인(`!inner`)으로 필터. 예:
  `.select('*, artist_sites!inner(site_slug)').eq('artist_sites.site_slug', siteSlug)`

---

## 8. `apps/admin` 상세

- Next.js 15 앱, 포트 3006, `@repo/next-config`/`@repo/eslint-config`/`@repo/typescript-config` 사용.
- `middleware.ts`로 전체 라우트 인증 가드 → 미로그인 시 `/login`.
- `serverExternalPackages: ['sharp']` 로 sharp 서버 외부화.
- **UI는 직접 구축**: `pnpm dlx shadcn@latest init` (Tailwind v4 + React 19 지원).
  기본 세트: `table`, `form`, `dialog`, `input`, `select`, `sonner`(토스트).
- CRUD는 server action + `@repo/content`의 zod 스키마·Supabase 서버 클라이언트·`toWebp` 사용.

---

## 9. 환경 변수

| 변수 | 위치 | 용도 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | admin + 4 sites | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | admin + 4 sites | 공개 읽기(anon) 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | admin (서버 전용) | 특권 작업 |
| `REVALIDATE_SECRET` | admin/orchestrator + 4 sites | `/api/revalidate` 시크릿 검증 |

- 모든 `.env*`는 gitignore. `.env.example`에 키 이름만 추가.

---

## 10. 기존 하드코딩 데이터 마이그레이션

현재 `source.ts` / `config.ts`의 데이터를 **시드 SQL/스크립트**로 이관.
- VFL 아티스트 6명(`Juntaro/Sielo/SAM/DearBoi/PLAYMODE/Loozbone`) → `artists` + `artist_sites`.
- payday `Release[]` → `releases` + `release_sites`.
- VFL `MusicInfo[]` → `releases`(통합 스키마로 매핑) + `release_sites`.
- 기존 `/public/images/**`의 webp를 Storage `media` 버킷으로 업로드하고 경로 갱신.
- `fullDescription`의 EN/KO 혼합 문자열을 `*_en`/`*_ko`로 분리(수작업 검수 필요).

---

## 11. 단계별 로드맵

| Phase | 범위 | 산출물 |
|---|---|---|
| **P1 — 토대** | ①admin 스켈레톤 + ②`packages/content` + ③SQL 마이그레이션 | 타입/클라이언트/스키마/DB, 빈 대시보드 (lint·check-types 통과) |
| **P2 — Admin UI** | shadcn로 CRUD 화면 구축 (사용자 주도) | Artist/Music/Tour 목록·편집·이미지 업로드 |
| **P3 — 사이트 연동** | revalidate 오케스트레이터 + 각 사이트 `/api/revalidate` + `queries` 태깅 소비 | 저장→반영 파이프라인 완성 |
| **P4 — 데이터 이관** | 기존 하드코딩 → 시드, 이미지 Storage 이전 | 실데이터로 4개 사이트 전환 |

> P1은 여러 파일·멀티커밋이므로 격리 환경(`claude/admin-music-artist-tour-...` 브랜치)에서 진행,
> `pnpm install → lint → check-types`로 검증 후 커밋.

---

## 12. 향후 업그레이드 / 미해결

- **콜라보 조인 테이블 승격**: `featured_artists text[]` → `release_artists(release_id, artist_id, role)`.
  피처링 아티스트에 프로필 링크·교차검색이 필요해지면 전환.
- **언어 추가**: `*_en`/`*_ko` 패턴에 컬럼 추가, 또는 `translations` 테이블로 정규화.
- **Storage 파일 라이프사이클**: 엔티티 삭제 시 고아 이미지 정리(트리거/배치).
- **Admin 권한 세분화**: 편집자 롤 구분이 필요하면 RLS에 role 클레임 추가.
- **호스팅 이전 옵션**: Vercel 비용 이슈 시 Cloudflare Pages/Netlify로 사이트 이전(Supabase 유지).

---

## 13. 열린 결정 (구현 전 확인용)

- `celebrate-agency`가 Music/Artist/Tour 중 무엇을 노출하는지 (현재 미확인).
- 초기 편집자 계정 수 / 이메일.
- `platform_links`에 포함할 플랫폼 확정(현재: beatport/spotify/appleMusic/soundcloud/youtubeMusic).
- 오케스트레이터: Edge Function(권장) vs 웹훅 4개 broadcast 중 선택.
