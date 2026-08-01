-- 0001_init.sql — CMS 토대 스키마 (cms-plan.md §6 정본)
-- Music / Artist / Tour 콘텐츠 소스. 엔티티는 사이트 소속(site_slug FK) — 공유 자산 아님.
-- 같은 인물이 여러 사이트에 필요하면 사이트별 행을 각각 만든다. slug는 사이트 내 유니크
-- (unique(site_slug, slug)), 정렬은 엔티티의 sort_order. 다국어는 *_en/*_ko,
-- 콜라보는 featured_artists text[](v1).

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

-- 편집자 화이트리스트. 행은 넣지 않는다(§13: 계정 정보는 코드에 없음 — 운영자가 콘솔/SQL로 추가).
-- RLS 활성화 + 정책 없음 = 기본 거부 → service_role만 접근(RLS 우회).
create table public.editors (
  user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.editors enable row level security;
-- self-read: 로그인 사용자가 자신의 멤버십만 조회(admin dashboard 가드). 쓰기 정책은 없음.
create policy editors_self_read on public.editors
  for select to authenticated using (user_id = auth.uid());

-- RLS
--   읽기: 참조 데이터 포함 전체 공개(anon SELECT) — 4개 테이블.
--   쓰기: editors 화이트리스트에 든 authenticated만 — sites(참조 데이터)는 제외,
--         변경은 마이그레이션/service_role 경유만.
do $$
declare t text;
begin
  foreach t in array array[
    'sites','artists','releases','tours'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for select using (true)', t || '_read', t);
  end loop;

  foreach t in array array[
    'artists','releases','tours'
  ]
  loop
    execute format(
      'create policy %I on public.%I for all to authenticated '
      'using (exists (select 1 from public.editors where user_id = auth.uid())) '
      'with check (exists (select 1 from public.editors where user_id = auth.uid()))',
      t || '_write', t);
  end loop;
end $$;

-- Storage: media 버킷 (public read, editors write)
-- 경로 규칙: {entity}/{site}/{slug}/{kind}-{hash8}.webp
--   (예: artist/vague-frequency-labs/juntaro/profile-a1b2c3d4.webp)
--   소속 모델에서 slug는 사이트 내 유니크이므로 {site} 프리픽스로 경로 충돌을 방지한다.
insert into storage.buckets (id, name, public) values ('media','media',true)
  on conflict (id) do nothing;
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');
create policy "media_editors_write" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'media'
    and exists (select 1 from public.editors where user_id = auth.uid())
  )
  with check (
    bucket_id = 'media'
    and exists (select 1 from public.editors where user_id = auth.uid())
  );
