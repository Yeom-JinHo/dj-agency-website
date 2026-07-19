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
| 사이트 소비 | **ISR + on-demand revalidate (방식 B: admin 직접 호출)** | 시간 기반 revalidate 미사용. A(DB 웹훅)는 향후 옵션 |
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
| ✅ **on-demand(admin 저장 시 직접 revalidate)** | 편집자 저장 시에만 | write ~ 하루 수 건 |

- 우리는 on-demand 방식 → **write 최소**, 나머지 트래픽은 전부 CDN 캐시(read).
- 실제 비용 요인은 ISR이 아니라 ① 이미지 최적화 ② 대역폭 ③ 함수 호출인데,
  webp 저장 + 정적 캐시 설계로 셋 다 회피.
- **Hobby(무료)**로도 이 트래픽이면 대체로 커버. 단 Hobby는 비상업용만 허용 →
  에이전시 사이트는 약관상 **Pro($20/월, 팀 단위·4개 사이트 통합)** 권장. 그 안에서 안정적.
- Vercel을 벗어나고 싶으면 Cloudflare Pages / Netlify / 셀프호스트로 이전하고
  Supabase는 그대로 사용 가능(향후 옵션).

### ⚠️ Supabase 무료 티어 pause 리스크
무료 티어는 **7일간 API 비활성 시 프로젝트가 자동 pause**되며, 요청으로 자동 복구되지 않고
**대시보드에서 수동 restore**해야 한다. 이 아키텍처는 "캐시 HIT 대부분, DB 조회 희소"가 장점인데
바로 그 특성이 pause 트리거가 된다(편집 없는 7일 = Supabase 관점의 완전 비활성).
잠든 뒤의 실패 모드:
1. **배포 실패** — `next build`가 목록 페이지 프리렌더 시 Supabase를 조회 → 빌드가 죽음.
2. **캐시 MISS 시 500** — Vercel 데이터 캐시 evict 직후 재생성 실패.
3. **admin 저장 실패** — 편집하러 들어가면 저장부터 안 됨.

**대응(확정): admin 앱에 Vercel Cron keepalive** — 하루 1회 초경량 조회(`select 1` 수준의
PostgREST 호출) route를 두고 cron으로 호출해 7일 윈도우를 매일 리셋. 비용 0.
트래픽·용량이 무료 한도를 넘으면 Supabase Pro 승격으로 자연 해소(§12).

---

## 4. 아키텍처 & 데이터 흐름

### 4.1 전체 그림

```
편집자 ─(수정)→ [apps/admin] ─┬─→ [Supabase DB] 저장
                              └─(저장 성공 후 직접 호출)─→ 각 사이트 /api/revalidate → revalidateTag
                                                                                       │
방문자 ─→ [Vercel CDN 캐시] ──(HIT: 대부분)──────────────────────────────────→ 정적 HTML
                └──(MISS: 무효화 직후 1회)──→ 서버 렌더 → Supabase 조회 → 캐시 저장
```

> **방식 B(admin 직접 호출)로 확정.** admin이 DB 저장에 성공하면 자신이 방금 바꾼 엔티티·노출
> 사이트를 근거로 각 사이트 `/api/revalidate`를 직접 POST한다. DB 웹훅+오케스트레이터를 쓰는
> **방식 A는 향후 옵션**(§12)으로 남긴다. 끝단(`/api/revalidate` + 태그 규약)이 동일하므로 나중에
> A로 승격하거나 병행해도 사이트 코드는 그대로 재사용된다.

### 4.2 읽기 경로 (방문자)

```
방문자 → [Vercel CDN 캐시]
   캐시 HIT (대부분) ──→ 정적 HTML 즉시 반환 (Supabase 조회 X)
   캐시 MISS ─────────→ 서버 컴포넌트 → @repo/content 조회 → Supabase fetch → HTML 생성 → 캐시 저장
```

조회 함수는 **태그**를 달아 캐시한다:

```ts
// slug는 사이트 내 유니크 → 태그·캐시 키 모두 사이트 결합
export const getArtist = (site: SiteSlug, slug: string) =>
  unstable_cache(
    () => fetchArtistFromSupabase(site, slug),
    ["artist", site, slug],
    { tags: [`artist:${site}:${slug}`, `artists:${site}`] } // ← 무효화 키
  )();
```

### 4.3 쓰기 경로 (편집자) — 핵심

예시: 편집자가 Juntaro 프로필을 수정·저장.

```
1. [apps/admin] 폼 저장 (shadcn Form) → server action
2. [server action] zod 검증 → supabase.from('artists').update(...)
3. [Supabase Postgres] UPDATE 커밋 (성공 확인)
4. [admin] 태그·대상 계산 — **대상 사이트 = 엔티티의 소속 사이트 1개** (라우트 컨텍스트로 이미 앎)
      · 태그: [`artist:vague-frequency-labs:juntaro`, `artists:vague-frequency-labs`]
      · 소속 모델이라 노출 해제·합집합 계산이 없음 (유령 캐시 문제 원천 소멸)
5. [admin → 소속 사이트 POST /api/revalidate] (시크릿 헤더 검증)
      · revalidateTag(`artist:vague-frequency-labs:juntaro`)
      · revalidateTag(`artists:vague-frequency-labs`)  // 목록도 갱신
      · 응답을 await → 편집자에게 "발행 완료 / 실패(재시도)" 즉시 피드백
6. 해당 태그 캐시만 무효화
7. 다음 방문자 요청 시 캐시 MISS 경로로 1회 재생성 → 새 내용 반영
```

**비용 발생은 6→7뿐이며, 저장한 그 순간·영향받은 태그만.**

#### 발행 로직은 한 곳에 모은다
뮤테이션마다 revalidate를 흩뿌리지 않도록 `packages/content`에 `publish(tags, sites)` 헬퍼를
두고 모든 server action이 이 한 함수만 호출한다. 사이트 URL·시크릿은 admin env로 관리
(`REVALIDATE_SECRET`, 사이트별 base URL). "발행 깜빡" 위험을 구조적으로 제거한다.

> **커버리지 주의(방식 B의 한계):** admin을 거치지 않은 변경(Supabase Studio 수동 편집, SQL,
> 벌크 임포트)은 자동 반영되지 않는다. 그런 경로를 자주 쓰게 되면 §12의 방식 A(DB 웹훅)를
> 안전망으로 추가한다.

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
      publish/           - publish(tags, sites) 헬퍼 (admin이 사이트 revalidate 호출)
supabase/
  migrations/            - SQL 마이그레이션 (스키마 + RLS + Storage)
  functions/             - (향후) 방식 A 승격 시 revalidate 오케스트레이터 Edge Function
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
  "./queries":           "./src/queries/index.ts",
  "./publish":           "./src/publish/index.ts"        // 서버 전용(admin 발행)
}
```

---

## 6. DB 스키마 (SQL)

핵심 설계: **엔티티는 사이트 소속**(`site_slug` FK) — 공유 자산 아님. 같은 인물이 여러
사이트에 필요하면 사이트별 행을 각각 만든다(예: VFL의 Juntaro와 celebrate의 Juntaro는 별개 행).
slug는 **사이트 내 유니크**(`unique(site_slug, slug)`), 정렬은 엔티티의 `sort_order`.
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

-- artists (사이트 소속)
create table public.artists (
  id                   uuid primary key default gen_random_uuid(),
  site_slug            text not null references public.sites(slug),
  slug                 text not null,
  name                 text not null,
  nickname             text,
  short_description_en text,
  short_description_ko text,
  full_description_en  text,
  full_description_ko  text,
  image_path           text,   -- Storage 경로 (.webp)
  logo_image_path      text,
  image_placeholder    text,   -- blurDataURL base64
  city                 text,          -- celebrate roster 용
  selected_works       jsonb not null default '[]'::jsonb,  -- celebrate: [{title, meta}]
  socials              jsonb not null default '[]'::jsonb,  -- [{platform, url, label?}] (platform은 enum)
  sort_order           int  not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (site_slug, slug)
);
create trigger artists_set_updated_at before update on public.artists
  for each row execute function public.set_updated_at();

-- releases (음원, 사이트 소속)
create table public.releases (
  id                   uuid primary key default gen_random_uuid(),
  site_slug            text not null references public.sites(slug),
  slug                 text not null,
  title                text not null,
  primary_artist_id    uuid references public.artists(id) on delete set null,
  artist_credit        text,          -- 표시용. 로스터에 없는 외부 아티스트(예: "Sam Collins") 대응
  featured_artists     text[] not null default '{}',
  label                text,
  catalog_no           text,
  artwork_path         text,   -- .webp
  artwork_placeholder  text,   -- blurDataURL base64 (toWebp가 항상 생성)
  short_description_en text,
  short_description_ko text,
  full_description_en  text,
  full_description_ko  text,
  release_date         date,
  platform_links       jsonb not null default '{}'::jsonb, -- {beatport,spotify,appleMusic,soundcloud,youtubeMusic}
  socials              jsonb not null default '[]'::jsonb,  -- [{platform, url, label?}]
  sort_order           int  not null default 0,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  unique (site_slug, slug)
);
create trigger releases_set_updated_at before update on public.releases
  for each row execute function public.set_updated_at();

-- tours (신규 엔티티, 사이트 소속)
create table public.tours (
  id             uuid primary key default gen_random_uuid(),
  site_slug      text not null references public.sites(slug),
  slug           text not null,
  title          text not null,
  artist_id      uuid references public.artists(id) on delete set null,
  venue          text,
  city           text,
  country        text,
  event_date     timestamptz not null,
  door_time      text,
  ticket_url     text,
  poster_path         text,   -- .webp
  poster_placeholder  text,   -- blurDataURL base64
  description_en text,
  description_ko text,
  status         text not null default 'scheduled'
                   check (status in ('scheduled','soldout','cancelled')), -- 'past'는 event_date로 유도
  sort_order     int  not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (site_slug, slug)
);
create trigger tours_set_updated_at before update on public.tours
  for each row execute function public.set_updated_at();

-- 인덱스 (읽기 경로: 소속 사이트 필터 + 정렬)
create index idx_artists_site            on public.artists  (site_slug, sort_order);
create index idx_releases_site           on public.releases (site_slug, sort_order);
create index idx_tours_site              on public.tours    (site_slug, sort_order);
create index idx_releases_primary_artist on public.releases (primary_artist_id);
create index idx_tours_artist            on public.tours    (artist_id);
create index idx_tours_event_date        on public.tours    (event_date desc);
```
### RLS & Storage

```sql
-- editors 화이트리스트 (P1 리뷰 반영으로 확정된 모델)
create table public.editors (
  user_id uuid primary key references auth.users(id) on delete cascade
);
-- editors: RLS on + self-read만 (user_id = auth.uid() 조건 select). 쓰기 정책 없음(service_role/콘솔 전용).

-- 엔티티 테이블 RLS: 공개 읽기 + editors 화이트리스트 쓰기 (do $$ 루프로 일괄 생성)
--   create policy <t>_read  on public.<t> for select using (true);
--   create policy <t>_write on public.<t> for all to authenticated
--     using (exists (select 1 from public.editors where user_id = auth.uid()))
--     with check (exists (select 1 from public.editors where user_id = auth.uid()));
-- sites는 읽기 전용(쓰기 정책 없음) — 참조 데이터 변경은 마이그레이션/service_role 경유만.

-- Storage: media 버킷 (public read, editors write — 동일 exists 검증 결합)
insert into storage.buckets (id, name, public) values ('media','media',true);
create policy "media_public_read"   on storage.objects for select using (bucket_id = 'media');
create policy "media_editors_write" on storage.objects for all to authenticated
  using (bucket_id = 'media' and exists (select 1 from public.editors where user_id = auth.uid()))
  with check (bucket_id = 'media' and exists (select 1 from public.editors where user_id = auth.uid()));
```

> Storage 경로 규칙: `{entity}/{slug}/{kind}-{contentHash8}.webp`
> (예: `artist/juntaro/profile-a1b2c3d4.webp` — 해시 파일명이 §13 캐시버스팅을 담당.
> 소속 모델에서 slug는 사이트 내 유니크이므로 경로 충돌 방지를 위해 `{entity}/{site}/{slug}/...`로
> 사이트 프리픽스를 포함할 것.)

---

## 7. `packages/content` 상세

### 7.1 zod 스키마 (`schema/`)
- `social.ts` — `{ platform: SocialPlatform, url, label? }` (platform enum + 아이콘은 코드 매핑)
- `site.ts` — `SITE_SLUGS` 상수 + `SiteSlug` 타입
- `artist.ts` / `release.ts` / `tour.ts` — 각 엔티티의 zod 스키마 + `z.infer` 타입
  (artist는 `city`/`selected_works`, release는 `artist_credit` 포함; 설명은 `*_en`/`*_ko`)
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
- `getArtists(siteSlug)`, `getArtistBySlug(siteSlug, slug)` — **siteSlug 필수** (소속 모델)
- `getReleases(siteSlug)`, `getReleaseBySlug(siteSlug, slug)`
- `getTours(siteSlug)`
- 소속 필터는 단순 컬럼 조건: `.eq('site_slug', siteSlug).order('sort_order')`.
  (조인 테이블이 사라져 이전의 referencedTable no-op 문제 자체가 소멸.)
- 캐시 태그는 사이트 결합(`contentTags` 빌더 경유): `artist:${site}:${slug}` / `artists:${site}` 등.

### 7.5 발행 헬퍼 (`publish/`, 서버 전용) — 방식 B
```ts
// admin server action이 DB 저장 성공 후 호출. 엔티티의 소속 사이트 1곳에만 revalidate POST.
// 뮤테이션마다 흩뿌리지 않도록 이 한 함수로 중앙화.
export async function publish(tags: string[], site: SiteSlug): Promise<PublishResult> { ... }
```
- 사이트별 base URL + `REVALIDATE_SECRET`는 admin env로 주입.
- 각 사이트 `/api/revalidate`는 시크릿 검증 후 `tags.forEach(revalidateTag)`.
- 응답을 모아 편집자에게 발행 성공/실패를 피드백.

---

## 8. `apps/admin` 상세

- Next.js 15 앱, 포트 3006, `@repo/next-config`/`@repo/eslint-config`/`@repo/typescript-config` 사용.
- **라우트 구조는 사이트-우선**: `/[site]/artists · /[site]/releases · /[site]/tours`.
  대시보드(`/`)는 사이트 4카드, 각 사이트 홈은 카테고리 3카드. 헤더에 사이트 스위처 +
  카테고리 내비(활성 강조). 엔티티 폼에서 "사이트 노출" UI는 없음 — 소속은 라우트 컨텍스트로
  자동 결정되고, 정렬은 엔티티 `sort_order` 필드로 편집.
- `middleware.ts`로 전체 라우트 인증 가드 → 미로그인 시 `/login`.
- 초기 편집자는 **본인 1명**(`o1086291943@gmail.com`), Supabase Auth 콘솔에서 초대. 회원가입 UI 없음.
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
| `REVALIDATE_SECRET` | admin + 4 sites | `/api/revalidate` 시크릿 검증 |
| `NEXT_PUBLIC_*_URL` (사이트별 base URL) | admin | 발행 시 각 사이트 `/api/revalidate` 대상 (기존 cross-site URL 재사용) |

- 모든 `.env*`는 gitignore. `.env.example`에 키 이름만 추가.
- **주의: 기존 cross-site URL은 3개 앱만 커버** (`packages/utils/src/app-urls.ts`에 juntaro 없음).
  `NEXT_PUBLIC_JUNTARO_URL` 신설 + `getAppUrls()` 확장이 P3 선행 작업.

---
## 10. 기존 하드코딩 데이터 마이그레이션

현재 `source.ts` / `config.ts`의 데이터를 **시드 SQL/스크립트**로 이관.
**소속 모델 기준: 각 앱의 데이터는 해당 사이트 소속 행으로 시드한다. 사이트 간 병합 없음.**
- VFL 아티스트 6명(`Juntaro/Sielo/SAM/DearBoi/PLAYMODE/Loozbone`) → `artists(site_slug='vague-frequency-labs')`.
- payday `Release[]` → `releases(site_slug='payday-records')`.
- VFL `MusicInfo[]` → `releases(site_slug='vague-frequency-labs')`(통합 스키마로 매핑).
- **juntaro `TRACKS[]` 15곡**(`src/consts/tracks.ts`) → `releases(site_slug='juntaro')`.
- **juntaro `TOUR_DATES[]` 8건**(`src/consts/tours.ts`) → `tours(site_slug='juntaro')`. **시드 데모 데이터로 취급**
  (venue는 PR #221의 연출용 데이터, 실제 공연 이력 아님). `dateLabel`/`year` 문자열 →
  `event_date timestamptz` 파싱 규칙을 시드 스크립트에 명시.
- **celebrate roster `Artist[]`** → `artists(site_slug='celebrate-agency')` **별도 행으로 전량 시드.**
  VFL 6명과 겹치는 인물도 병합하지 않고 celebrate 소속 행을 따로 만든다(§13 소속 모델 결정 —
  이름·사진 변경 시 두 곳 수정을 감수). celebrate의 work-case·stats는 이관 대상 아님(하드코딩 유지).
- 기존 `/public/images/**`의 webp를 Storage `media` 버킷으로 업로드하고 경로 갱신.
- `fullDescription`의 EN/KO 혼합 문자열을 `*_en`/`*_ko`로 분리(수작업 검수 필요).
- **slug 시드 규칙**: `slug = 기존 라우트 파라미터 값`(VFL `[artistName]`에 실제 들어가는 문자열)으로
  맞춰 기존 URL·SEO를 그대로 보존(redirect 불필요). VFL 라우트는 P3~P4에서 이름 기반 →
  slug 기반 소비로 전환하되 파라미터 값이 동일하므로 URL 불변.

---

## 11. 단계별 로드맵

| Phase | 범위 | 산출물 |
|---|---|---|
| **P1 — 토대** | ①admin 스켈레톤 + ②`packages/content` + ③SQL 마이그레이션 | 타입/클라이언트/스키마/DB, 빈 대시보드 (lint·check-types 통과) |
| **P2 — Admin UI** | shadcn로 CRUD 화면 구축 (사용자 주도) | Artist/Music/Tour 목록·편집·이미지 업로드 |
| **P3 — 사이트 연동** | `publish()` 헬퍼(방식 B) + 각 사이트 `/api/revalidate` + `queries` 태깅 소비 | 저장→반영 파이프라인 완성 |
| **P4 — 데이터 이관** | 기존 하드코딩 → 시드, 이미지 Storage 이전 | 실데이터로 4개 사이트 전환 |

### 브랜치 전략 & 작업 환경

- **피처 베이스 브랜치**: 최신 `origin/master`에서 **`feat/admin`**을 딴다
  (`git fetch origin master` 후 분기 — 레포 규칙).
- **Phase 작업 브랜치**: `feat/admin`을 base로 분기(예: `feat/admin-p1-foundation`),
  PR도 `feat/admin`을 대상으로. `master`에는 최종 통합 시에만 PR.
- **전용 워크트리에서 작업**: `git worktree add .worktrees/admin feat/admin` —
  멀티 파일·멀티 커밋 작업이므로 메인 체크아웃과 격리(워크트리 경로 규칙:
  `~/github/v.f.labs/.worktrees/<slug>`). Phase 브랜치 체크아웃도 이 워크트리 안에서.
- **최종 통합**: 전체 Phase 완료 후 `feat/admin` → `master` PR.
  통합 전 `master` 기준 리베이스로 정렬. 머지 후 워크트리 제거.
- **검증**: 각 커밋 전 `pnpm install → lint → check-types` 통과 확인.

---

## 12. 향후 업그레이드 / 미해결

- **콜라보 조인 테이블 승격**: `featured_artists text[]` → `release_artists(release_id, artist_id, role)`.
  피처링 아티스트에 프로필 링크·교차검색이 필요해지면 전환.
- **언어 추가**: `*_en`/`*_ko` 패턴에 컬럼 추가, 또는 `translations` 테이블로 정규화.
- **Storage 파일 라이프사이클**: 엔티티 삭제 시 고아 이미지 정리(트리거/배치).
- **Admin 권한 세분화** — **방향 확정: 공유 editors 모델 유지 + 사이트 단위 권한으로 확장.**
  편집자가 늘어 사이트별 권한 구분이 필요해지면, `editors`는 "admin 접근 가능"의 공유
  화이트리스트로 유지하고 `editor_sites(user_id, site_slug)` 조인 테이블을 추가한다.
  RLS 쓰기 정책의 editors exists 검증에 "대상 행의 `site_slug`가 그 편집자의 `editor_sites`에
  존재" 조건을 결합하면 스키마·admin 인가 구조 변경 없이 확장된다(소속 모델이라 조건이
  단일 컬럼 비교로 단순). 역할(role) 클레임 방식은 채택하지 않음. 편집자 1명인 현재는
  구현하지 않는다.
- **호스팅 이전 옵션**: Vercel 비용 이슈 시 Cloudflare Pages/Netlify로 사이트 이전(Supabase 유지).
- **revalidate 방식 A(DB 웹훅) 승격**: admin 외 경로(Supabase Studio 수동 편집·SQL·벌크 임포트)의
  변경까지 자동 반영해야 할 때. Database Webhook + 오케스트레이터 Edge Function을 추가하며,
  사이트 `/api/revalidate`와 태그 규약은 그대로 재사용. B와 병행 가능(revalidateTag는 멱등).

---

## 13. 세부 결정 (확정)

- **소속 모델 전환 (2026-07-19)** → **엔티티는 사이트 소속, 공유 자산 아님.**
  `*_sites` 조인 테이블 폐기, `site_slug` FK + 엔티티 `sort_order` + `unique(site_slug, slug)`.
  근거: 실데이터 확인 결과 VFL 6명 전원이 celebrate roster에도 등장하지만, 사이트별 필드가
  이미 분리돼 있어(celebrate=city/selected_works/자체 bio, VFL=fullDescription/logo) 공유 실익이
  이름·slug 수준. 소속 모델로 스키마·revalidate(합집합·유령 캐시 소멸)·admin UX(사이트-우선
  라우트)가 전부 단순화. **감수 비용: 공통 인물의 이름·사진 변경 시 사이트별 행 각각 수정.**
  교차 사이트 집계 요구 없음 확인. slug는 사이트 내 유니크.
- **celebrate-agency 범위** → **Artist만.** roster는 celebrate 소속 `artists` 행을 소비.
  work-case 쇼케이스·stats는 표현 전용이라 **기존 하드코딩 유지**(CMS 범위 밖).
  Music/Tour 노출은 향후 필요 시 재검토.
- **초기 편집자 계정** → **본인 1명** (`o1086291943@gmail.com`).
  코드/시드에는 넣지 않고 Supabase Auth 콘솔에서 초대. 추가 편집자는 이후 콘솔에서.
- **`platform_links` 목록** → **5개 확정**: `beatport`, `spotify`, `appleMusic`,
  `soundcloud`, `youtubeMusic`. (레포 사용 빈도와 일치. 컬럼 아닌 jsonb라 추가 용이.)
- **발행 상태** → **즉시 공개.** draft/publish 상태·미리보기 미도입(편집자 1명). 저장→revalidate→라이브.
  향후 필요 시 `published boolean` 경량 플래그부터 추가.
- **celebrate 전용 필드** → **`artists`에 `city text` + `selected_works jsonb` 추가.**
  다른 사이트는 null. celebrate roster 완전 CMS화.
- **socials 입력** → **플랫폼 enum 선택식.** 데이터는 `[{platform, url, label?}]`, 아이콘은 코드에서 매핑.
  라이브러리 종속 `iconName` 문자열 제거.
- **slug 수명주기** → **생성 후 불변(immutable).** 생성 시 이름 기반 자동 생성, admin 폼에
  slug 수정 필드를 노출하지 않는다. slug는 라우트·캐시 태그·Storage 경로에 4중 결합이라
  변경 지원(redirect·태그·경로 이동)은 편집자 1명 체제에서 과설계 — 미도입.
  정말 바꿔야 하면 개발자가 SQL + `next.config` redirect로 수동 처리.
- **en/ko 렌더** → **스키마는 en/ko 분리 유지(i18n-ready).** 사이트 표시 전략(stack vs 로케일 택1)은
  **i18n 작업(PR #223, "feat(vfl): 한국어/영어 i18n — next-intl", OPEN)에 위임** — 별도 PR에서 확정.
  CMS는 구조화 저장만 책임. *(이전 #228 인용은 오기 — #228은 별개의 VFL 리뷰 반영 PR.)*

### 리뷰 반영 — 구현 시 자동 처리 (🔴)
다각도 리뷰에서 나온 착수-전-필수 항목. 코드/설정으로 해결하며 별도 결정 불요:
- `releases.artist_credit` 컬럼 추가(로스터 밖 아티스트 표시) — **반영됨(§6)**.
- **교차 엔티티 revalidate**: 아티스트 변경 시 연결된 `releases`/`tours` 리스트 태그도 무효화.
- **신규 slug 동적 라우트**: 정적 `generateStaticParams` → `dynamicParams = true` + ISR 태깅 전환(P3).
- **Server Action 본문 한도**: admin next.config `serverActions.bodySizeLimit` 상향(이미지 업로드).
- **next/image `remotePatterns`**: `@repo/next-config`에 Supabase Storage 호스트 추가.
- **turbo.json `globalEnv`**: `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`, `REVALIDATE_SECRET`,
  `NEXT_PUBLIC_JUNTARO_URL` 등록 (현재 3개 사이트 URL + NODE_ENV뿐. 미등록 시
  `turbo/no-undeclared-env-vars` 경고 → `--max-warnings 0` 빌드 실패).
- **`getAppUrls()` juntaro 확장**: `packages/utils/src/app-urls.ts`가 3개 앱만 처리 —
  juntaro 항목 추가(§9 참조).
- **Supabase Auth 공개 가입 비활성화**: RLS `authenticated` 무력화 방지(초대 전용) — 운영 설정.
- **Storage 덮어쓰기 캐시버스팅**: 재업로드 시 파일명 해시 또는 버전 쿼리.
- **tours `status`에서 `past` 제거**: `event_date`로 유도, 저장값은 scheduled/soldout/cancelled.
- **Supabase keepalive cron**: admin에 하루 1회 초경량 조회 route + Vercel Cron 등록 —
  무료 티어 7일 비활성 pause 방지(§3 리스크 참조). P1 admin 스켈레톤에 포함.

> 남은 열린 결정 없음. Phase 1 구현 착수 가능.