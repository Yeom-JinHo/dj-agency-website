-- 0001_init.sql — CMS 토대 스키마 (cms-plan.md §6 정본)
-- Music / Artist / Tour 단일 콘텐츠 소스. 엔티티↔사이트는 다대다(조인 테이블),
-- 다국어는 *_en/*_ko, 콜라보는 featured_artists text[](v1).

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
  city                 text,          -- celebrate roster 용
  selected_works       jsonb not null default '[]'::jsonb,  -- celebrate: [{title, meta}]
  socials              jsonb not null default '[]'::jsonb,  -- [{platform, url, label?}] (platform은 enum)
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
  poster_path         text,   -- .webp
  poster_placeholder  text,   -- blurDataURL base64
  description_en text,
  description_ko text,
  status         text not null default 'scheduled'
                   check (status in ('scheduled','soldout','cancelled')), -- 'past'는 event_date로 유도
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger tours_set_updated_at before update on public.tours
  for each row execute function public.set_updated_at();

-- 엔티티 ↔ 사이트 노출 (다대다)
-- sort_order는 여기(조인 테이블)에 둔다: 같은 아티스트/릴리즈라도 사이트별 노출 순서가 독립.
create table public.artist_sites (
  artist_id  uuid references public.artists(id) on delete cascade,
  site_slug  text references public.sites(slug)  on delete cascade,
  sort_order int  not null default 0,
  primary key (artist_id, site_slug)
);
create table public.release_sites (
  release_id uuid references public.releases(id) on delete cascade,
  site_slug  text references public.sites(slug)   on delete cascade,
  sort_order int  not null default 0,
  primary key (release_id, site_slug)
);
create table public.tour_sites (
  tour_id    uuid references public.tours(id)  on delete cascade,
  site_slug  text references public.sites(slug) on delete cascade,
  sort_order int  not null default 0,
  primary key (tour_id, site_slug)
);

-- 인덱스 (읽기 경로: 사이트별 필터 + 노출 순서 정렬)
create index idx_releases_primary_artist on public.releases (primary_artist_id);
create index idx_tours_artist            on public.tours (artist_id);
create index idx_tours_event_date        on public.tours (event_date desc);
create index idx_artist_sites_site       on public.artist_sites (site_slug, sort_order);
create index idx_release_sites_site      on public.release_sites (site_slug, sort_order);
create index idx_tour_sites_site         on public.tour_sites (site_slug, sort_order);

-- RLS: 7개 테이블 일괄 — 공개 읽기(anon SELECT) + authenticated 쓰기(admin)
do $$
declare t text;
begin
  foreach t in array array[
    'sites','artists','releases','tours','artist_sites','release_sites','tour_sites'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy %I on public.%I for select using (true)', t || '_read', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (true) with check (true)',
      t || '_write', t);
  end loop;
end $$;

-- Storage: media 버킷 (public read, authenticated write)
-- 경로 규칙: artist/{slug}/profile.webp, release/{slug}/artwork.webp, tour/{slug}/poster.webp
insert into storage.buckets (id, name, public) values ('media','media',true)
  on conflict (id) do nothing;
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');
create policy "media_authenticated_write" on storage.objects
  for all to authenticated
  using (bucket_id = 'media') with check (bucket_id = 'media');
