-- 0002_editor_sites.sql — 편집자 사이트 단위 권한 (cms-plan.md §12 "Admin 권한 세분화" 확정안)
--
-- 0001의 모델은 `editors` 단일 화이트리스트였다: 행이 있으면 4개 사이트를 모두 쓸 수 있고
-- 특정 사이트만 떼어낼 수단이 없었다. `editors`는 "admin에 들어올 수 있다"의 공유 게이트로
-- 그대로 두고, "어느 사이트를 편집할 수 있다"를 `editor_sites` 조인 테이블로 분리한다.
--
-- 허용 목록(기본 거부) 모델이다 — 행이 없으면 그 사이트는 못 만진다. 새 사이트를 추가하거나
-- 새 편집자를 초대해도 명시적으로 부여하기 전까지는 닫혀 있다(거부 목록이라면 부여를 잊는
-- 쪽이 아니라 차단을 잊는 쪽이 사고가 된다).
--
-- 엔티티가 사이트 소속 모델(site_slug FK)이라 RLS 조건은 단일 컬럼 비교로 끝난다.
--
-- **적용 순서: 이 마이그레이션이 admin 배포보다 먼저다.** admin 코드는 로그인 시
-- `editor_sites`를 조회하고, 조회 실패를 "권한 없음"으로 강등시키지 않고 throw한다.
-- 코드가 먼저 나가면 테이블이 없어 그 throw가 레이아웃에서 터지고 admin 전 화면이
-- 에러로 떨어진다(0002 → 배포 순서면 시드가 현행 권한을 그대로 보존하므로 무중단).
-- 자세한 운영 절차는 cms-plan.md §13 "사이트 단위 편집 권한".

create table public.editor_sites (
  user_id   uuid not null references auth.users(id) on delete cascade,
  site_slug text not null references public.sites(slug) on delete cascade,
  primary key (user_id, site_slug)
);
-- PK가 (user_id, ...) 선행이라 "내 사이트 목록" 조회는 별도 인덱스 없이 PK 인덱스를 탄다.

alter table public.editor_sites enable row level security;
-- self-read: 본인 부여분만 조회(admin이 접근 가능 사이트 목록을 그리는 데 쓴다).
-- 쓰기 정책은 없음 — editors와 동일하게 운영자가 콘솔/SQL(service_role)로만 부여한다.
create policy editor_sites_self_read on public.editor_sites
  for select to authenticated using (user_id = (select auth.uid()));

-- auth.uid()를 (select auth.uid())로 감싸는 이유(아래 정책 전부 동일):
-- 그냥 호출하면 대상 행마다 재평가되고, 감싸면 플래너가 InitPlan으로 한 번만 계산해
-- 결과를 재사용한다. 쓰기 정책은 UPDATE/DELETE가 훑는 행 수만큼 비용이 붙으므로
-- 지금 규모에서도 공짜인 최적화다(Supabase RLS 성능 가이드의 권장 형태).
-- 0001의 editors_self_read도 같은 형태라 여기서 함께 교체한다 — 정책 정본을 0002 하나로
-- 모아 두 파일에 다른 모양의 같은 규칙이 남지 않게 한다.
drop policy if exists editors_self_read on public.editors;
create policy editors_self_read on public.editors
  for select to authenticated using (user_id = (select auth.uid()));

-- 기존 편집자는 4개 사이트를 모두 부여해 현행 동작을 그대로 보존한다. 권한 회수는
-- 이 마이그레이션이 아니라 운영자가 개별 행을 지워서 한다(예: juntaro만 차단).
--   delete from public.editor_sites where user_id = '<uuid>' and site_slug = 'juntaro';
-- 신규 편집자 초대·새 사이트 추가 시의 부여 절차는 cms-plan.md §13 런북에 있다.
-- **새 사이트를 추가하는 마이그레이션은 `sites` INSERT와 함께 `editor_sites` 부여를
-- 반드시 같이 넣어야 한다** — 기본 거부라 자동으로 열리지 않는다.
insert into public.editor_sites (user_id, site_slug)
select e.user_id, s.slug
  from public.editors e
 cross join public.sites s
on conflict do nothing;

-- 엔티티 쓰기 정책 교체: editors 게이트(admin 접근)에 대상 행의 site_slug 부여 여부를 결합.
-- 두 조건을 모두 유지하는 이유 — editors에서 빼는 것만으로 그 사람의 모든 권한이 즉시
-- 죽어야 한다(editor_sites 행이 남아 있어도).
-- 읽기 정책(*_read, anon 포함 select using(true))은 건드리지 않는다: 콘텐츠는 공개 사이트가
-- 서빙하는 공개 데이터다. 여기서 나누는 것은 편집 권한이다.
do $$
declare t text;
begin
  foreach t in array array['artists','releases','tours']
  loop
    execute format('drop policy if exists %I on public.%I', t || '_write', t);
    execute format(
      'create policy %I on public.%I for all to authenticated '
      'using ('
      '  exists (select 1 from public.editors where user_id = (select auth.uid()))'
      '  and exists (select 1 from public.editor_sites es'
      '              where es.user_id = (select auth.uid()) and es.site_slug = public.%I.site_slug)) '
      'with check ('
      '  exists (select 1 from public.editors where user_id = (select auth.uid()))'
      '  and exists (select 1 from public.editor_sites es'
      '              where es.user_id = (select auth.uid()) and es.site_slug = public.%I.site_slug))',
      t || '_write', t, t, t);
  end loop;
end $$;

-- Storage도 같은 기준으로 좁힌다. 경로 규약이 {entity}/{site}/{slug}/{kind}-{hash8}.webp(0001)
-- 이므로 두 번째 폴더가 사이트다. 규약을 벗어난 경로는 [2]가 NULL → 조건 거짓 → 거부(엄격 측).
drop policy if exists "media_editors_write" on storage.objects;
create policy "media_editors_write" on storage.objects
  for all to authenticated
  using (
    bucket_id = 'media'
    and exists (select 1 from public.editors where user_id = (select auth.uid()))
    and exists (
      select 1 from public.editor_sites es
       where es.user_id = (select auth.uid())
         and es.site_slug = (storage.foldername(name))[2]
    )
  )
  with check (
    bucket_id = 'media'
    and exists (select 1 from public.editors where user_id = (select auth.uid()))
    and exists (
      select 1 from public.editor_sites es
       where es.user_id = (select auth.uid())
         and es.site_slug = (storage.foldername(name))[2]
    )
  );
