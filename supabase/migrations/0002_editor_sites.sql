-- 0002_editor_sites.sql — 편집자 사이트 단위 권한 (cms-plan.md §12 확정 방향의 구현)
--
-- 0001의 `editors`는 "admin 접근 가능"만 표현하는 평평한 화이트리스트라, 초대된 편집자
-- 한 명이 4개 사이트를 모두 수정할 수 있었다. 편집자가 늘면서 "이 사람은 juntaro는
-- 못 만지게" 같은 요구가 생겼으므로, §12에 확정해 둔 방향대로 확장한다:
--   - `editors`는 그대로 둔다 — 여전히 "admin에 들어올 수 있는가"의 게이트다.
--   - `editor_sites(user_id, site_slug)` 조인 테이블이 "어느 사이트를 만질 수 있는가"를 맡는다.
-- 엔티티가 사이트 소속(site_slug FK)이라 권한 검사가 단일 컬럼 비교로 끝난다. 역할(role)
-- 클레임 방식은 §12에서 명시적으로 채택하지 않았다.
--
-- 계정 데이터는 코드에 두지 않는다(§13) — 이 마이그레이션은 기존 편집자에게 4개 사이트를
-- 전부 백필해 동작을 바꾸지 않는다. 특정 사용자에게서 사이트를 빼는 것은 운영자가
-- 콘솔/SQL로 행을 지워서 한다(파일 하단 운영 노트 참고).

-- 편집자 × 사이트 권한. 행이 있으면 그 사이트의 콘텐츠를 쓸 수 있다.
-- editors와 마찬가지로 쓰기 정책은 두지 않는다 — 부여/회수는 service_role/콘솔 전용.
create table public.editor_sites (
  user_id   uuid not null references auth.users(id)  on delete cascade,
  site_slug text not null references public.sites(slug) on delete cascade,
  primary key (user_id, site_slug)
);
alter table public.editor_sites enable row level security;

-- self-read: 로그인 사용자가 자신의 사이트 권한만 조회(admin이 사이트 목록을 그린다).
-- 남의 권한은 보이지 않는다. PK가 (user_id, site_slug)라 이 조회는 인덱스 선두 컬럼을 탄다.
create policy editor_sites_self_read on public.editor_sites
  for select to authenticated using (user_id = auth.uid());

-- 백필: 기존 편집자는 종전대로 전 사이트 권한. 이 마이그레이션만으로는 누구의 권한도
-- 줄어들지 않는다(권한 축소는 운영 작업이지 스키마 변경이 아니다).
insert into public.editor_sites (user_id, site_slug)
select e.user_id, s.slug
from public.editors e
cross join public.sites s
on conflict do nothing;

-- 엔티티 쓰기 정책 교체: 기존 editors 검증에 "대상 행의 site_slug를 그 편집자가 가졌는가"를
-- 결합한다(§12). 두 조건을 모두 남기는 이유 — editors는 admin 게이트, editor_sites는 범위로
-- 역할이 다르다. editors에서 빠진 사용자는 editor_sites 행이 남아 있어도 쓸 수 없다.
--
-- using과 with check 양쪽에 같은 조건을 건다. using만 걸면 "juntaro 행을 vfl로 옮기는"
-- update가 통과하고(옮긴 뒤 상태는 검사되지 않는다), with check만 걸면 juntaro 행을
-- vfl로 옮기는 반대 방향이 통과한다. 둘 다 걸어야 사이트 경계를 넘는 이동이 막힌다.
--
-- EXISTS 안에서 site_slug를 그냥 쓰면 서브쿼리의 editor_sites.site_slug로 해석되므로
-- 바깥 테이블명으로 한정한다(artists.site_slug 등).
do $$
declare t text;
begin
  foreach t in array array['artists','releases','tours']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_write', t);
    execute format(
      'create policy %I on public.%I for all to authenticated '
      'using ('
      '  exists (select 1 from public.editors where user_id = auth.uid())'
      '  and exists (select 1 from public.editor_sites es '
      '              where es.user_id = auth.uid() and es.site_slug = %I.site_slug)'
      ') '
      'with check ('
      '  exists (select 1 from public.editors where user_id = auth.uid())'
      '  and exists (select 1 from public.editor_sites es '
      '              where es.user_id = auth.uid() and es.site_slug = %I.site_slug)'
      ')',
      t || '_write', t, t, t);
  end loop;
end $$;

-- Storage도 같은 범위로 좁힌다. 경로 규약이 `{entity}/{site}/{slug}/{kind}-{hash8}.webp`
-- (0001 주석·entity-media.ts)라 2번째 세그먼트가 곧 사이트 슬러그다. 규약을 벗어난 경로는
-- split_part가 사이트가 아닌 값을 내놓아 어느 편집자에게도 매칭되지 않는다 — 즉 fail-closed.
-- (읽기는 media_public_read가 따로 허용하므로 이 정책을 좁혀도 공개 read는 영향 없다:
--  permissive 정책은 OR로 합쳐진다.)
drop policy if exists "media_editors_write" on storage.objects;
create policy "media_editors_write" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'media'
    and exists (select 1 from public.editors where user_id = auth.uid())
    and exists (
      select 1 from public.editor_sites es
      where es.user_id = auth.uid()
        and es.site_slug = split_part(storage.objects.name, '/', 2)
    )
  )
  with check (
    bucket_id = 'media'
    and exists (select 1 from public.editors where user_id = auth.uid())
    and exists (
      select 1 from public.editor_sites es
      where es.user_id = auth.uid()
        and es.site_slug = split_part(storage.objects.name, '/', 2)
    )
  );

-- 운영 노트 (계정 정보는 코드에 없다 — 콘솔 SQL 에디터에서 실행)
--
--   -- 특정 편집자에게서 juntaro 권한 회수
--   delete from public.editor_sites
--   where site_slug = 'juntaro'
--     and user_id = (select id from auth.users where email = '<편집자 이메일>');
--
--   -- 다시 부여
--   insert into public.editor_sites (user_id, site_slug)
--   select id, 'juntaro' from auth.users where email = '<편집자 이메일>'
--   on conflict do nothing;
--
--   -- 현재 권한 확인
--   select u.email, es.site_slug
--   from public.editor_sites es join auth.users u on u.id = es.user_id
--   order by u.email, es.site_slug;
--
-- 새 편집자를 초대할 때는 editors 행과 editor_sites 행을 함께 넣는다 — editors에만 넣으면
-- 로그인은 되지만 대시보드가 비어 있다(그 상태 자체는 정상 동작이며 빈 상태 안내가 뜬다).
