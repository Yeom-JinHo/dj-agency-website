"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@repo/content/supabase/server";
import { siteSlugSchema, type SiteSlug } from "@repo/content/schema";
import { contentTags } from "@repo/content/tags";
import type { Database } from "@repo/content/supabase/types";

import { publishOrWarn } from "@/lib/publish";
import { slugify } from "@/lib/media";
import {
  CONCURRENT_EDIT_MESSAGE,
  type EntityActionResult,
  toErrorMessage,
} from "@/lib/action-result";
import {
  imageFile,
  imageRemoved,
  removeImages,
  uploadEntityImage,
  validateImageFile,
} from "@/lib/entity-media";
import { tourFormSchema, formValuesToDbColumns } from "./schema";

/**
 * artist_id same-site 검증: select UI는 같은 사이트만 노출하지만(클라이언트 방어)
 * FK는 존재만 검사하므로, 타 사이트 아티스트 uuid를 직접 넣는 우회를 서버에서 차단한다.
 * (release의 assertArtistInSite와 동일 패턴)
 */
async function assertArtistInSite(
  supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>,
  artistId: string | null,
  site: string,
): Promise<string | null> {
  if (!artistId) return null;
  const { data } = await supabase
    .from("artists")
    .select("id")
    .eq("id", artistId)
    .eq("site_slug", site)
    .maybeSingle();
  return data ? null : "선택한 아티스트가 이 사이트 소속이 아닙니다.";
}

/**
 * admin 자신의 사이트-스코프 라우트 revalidate. 사이트 앱의 태그 캐시는 별개 배포라
 * 여기서 무효화되지 않는다 — 각 뮤테이션 종료점에서 publishOrWarn([contentTags.tours(site)])
 * 를 함께 호출해 사이트 /api/revalidate로 POST한다(태그는 contentTags 빌더로만 조립).
 */
function revalidateTours(site: SiteSlug, id?: string): void {
  revalidatePath(`/${site}/tours`);
  if (id) revalidatePath(`/${site}/tours/${id}`);
}

type Supabase = Awaited<ReturnType<typeof createServerSupabaseClient>>;

/**
 * 방금 올린 포스터가 행에 연결되지 않았을 때만 지우는 보상 삭제.
 *
 * 고아 판정은 이 요청의 로드 시점 경로가 아니라 행의 "현재" 경로를 재조회해서 한다 —
 * 두 탭이 같은 파일을 올리면 콘텐츠 해시가 같아 경로가 겹치는데, 로드 시점 기준으로
 * 판정하면 진 쪽이 이긴 저장의 라이브 파일을 지우게 된다. 같은 이유로 create의 컬럼
 * update 실패에도 재조회가 필요하다: 응답만 유실되고 서버에서 커밋됐다면 행이 이미
 * 그 경로를 가리키므로, 무조건 지우면 고아가 아니라 깨진 참조(사이트에 404 이미지)가
 * 남는다. 재조회에 실패하면 지우지 않는다 — 고아 잔존(removeImages 로그로 추적 가능)이
 * 라이브 파일 유실보다 낫다.
 */
async function removeUploadedOrphans(
  supabase: Supabase,
  id: string,
  uploadedPath: string | null | undefined,
): Promise<void> {
  if (!uploadedPath) return;
  const { data: current, error } = await supabase
    .from("tours")
    .select("poster_path")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error(
      `[admin] 고아 이미지 판정용 재조회 실패 — 정리 보류: ${uploadedPath}`,
      error.message,
    );
    return;
  }
  // 행이 사라진 경우(current null: 삭제가 레이스를 이김)엔 업로드가 곧 고아다.
  if (current?.poster_path === uploadedPath) return;
  await removeImages(supabase, [uploadedPath]);
}

export async function createTour(
  siteInput: string,
  formData: FormData,
): Promise<EntityActionResult<"title" | "artistId">> {
  try {
    // 라우트에서 온 site를 서버측에서 재검증(신뢰 경계) — 소속 모델은 site_slug 자동 부여.
    const site = siteSlugSchema.parse(siteInput);
    const values = tourFormSchema.parse(
      JSON.parse(String(formData.get("payload"))),
    );
    const columns = formValuesToDbColumns(values);

    const slug = slugify(values.title);
    if (!slug) {
      // slug는 제목에서만 파생되므로 고칠 곳은 항상 title 필드다.
      return {
        ok: false,
        error: "제목에서 slug를 만들 수 없습니다.",
        field: "title",
      };
    }

    // createServerSupabaseClient는 인증 세션을 실어 RLS(editors)가 서버측 방어로 동작.
    const supabase = await createServerSupabaseClient();

    // 이미지 유효성은 행 생성 전에 검사 — 불량 입력이 행을 만들지 않게.
    const poster = imageFile(formData, "posterImage");
    if (poster) validateImageFile(poster);

    const artistError = await assertArtistInSite(
      supabase,
      columns.artist_id ?? null,
      site,
    );
    if (artistError)
      return { ok: false, error: artistError, field: "artistId" };

    // insert-first: (site_slug, slug) 확보를 먼저 해 사이트 내 제목 중복(23505)에서
    // Storage 고아를 막고 update 경로와 대칭이 되게 한다.
    const { data, error } = await supabase
      .from("tours")
      .insert({ site_slug: site, slug, ...columns })
      .select("id")
      .single();
    if (error) {
      // 23505는 (site_slug, slug) 유니크 위반 = 제목 중복이라 title 필드에 귀속시킨다.
      // 그 밖의 DB 오류는 고칠 필드를 특정할 수 없어 토스트로 남긴다.
      if (error.code === "23505") {
        return {
          ok: false,
          error: `slug "${slug}"가 이미 존재합니다(사이트 내 제목 중복).`,
          field: "title",
        };
      }
      return { ok: false, error: error.message };
    }
    const id = data.id;

    // 행 생성 이후 단계(포스터 업로드 → poster 컬럼 update). 여기서 실패해도 행은
    // 이미 존재하므로 삭제하지 않고 편집 화면으로 안내(dead-end 회피).
    // 업로드 결과는 catch에서도 보여야 한다(컬럼 update 실패 시 업로드된 파일 보상 삭제).
    let posterUpload: { path: string; placeholder: string } | null = null;
    try {
      posterUpload = poster
        ? await uploadEntityImage(supabase, "tour", site, slug, "poster", poster)
        : null;

      if (posterUpload) {
        const imageColumns: Database["public"]["Tables"]["tours"]["Update"] = {
          poster_path: posterUpload.path,
          poster_placeholder: posterUpload.placeholder,
        };
        const { error: updateError } = await supabase
          .from("tours")
          .update(imageColumns)
          .eq("id", id);
        if (updateError) throw new Error(updateError.message);
      }
    } catch (postError) {
      // 업로드까지 됐지만 컬럼 update가 실패한 파일은 어떤 행도 참조하지 않는 고아 —
      // 편집 화면 재저장 시 같은 콘텐츠면 같은 해시 경로로 다시 올라가므로 지워도 안전.
      // 단, 판정은 행의 현재 경로 재조회로 한다(응답만 유실된 커밋 보호, 헬퍼 주석 참고).
      await removeUploadedOrphans(supabase, id, posterUpload?.path);
      // 행은 저장됐으니 포스터 없이라도 사이트에 반영(발행). 발행 경고는 포스터 경고에 덧붙인다.
      const publishWarning = await publishOrWarn([contentTags.tours(site)], site);
      revalidateTours(site, id);
      const imageWarning = `투어는 생성됐지만 포스터 저장에 실패했습니다(${toErrorMessage(postError)}). 편집 화면에서 포스터를 다시 저장해주세요.`;
      return {
        ok: true,
        id,
        warning: publishWarning ? `${imageWarning} ${publishWarning}` : imageWarning,
      };
    }

    const publishWarning = await publishOrWarn([contentTags.tours(site)], site);
    revalidateTours(site, id);
    return publishWarning
      ? { ok: true, id, warning: publishWarning }
      : { ok: true, id };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}

export async function updateTour(
  siteInput: string,
  id: string,
  formData: FormData,
): Promise<EntityActionResult<"artistId">> {
  try {
    const site = siteSlugSchema.parse(siteInput);
    const values = tourFormSchema.parse(
      JSON.parse(String(formData.get("payload"))),
    );
    const columns = formValuesToDbColumns(values);

    const supabase = await createServerSupabaseClient();

    // slug·site_slug는 불변(§13) — 기존 행에서 slug를 읽어 이미지 경로 조립·교체
    // 삭제에 쓴다. update 컬럼에는 slug/site_slug를 넣지 않는다.
    // site_slug 스코프: 타 사이트 투어를 이 site 컨텍스트로 조작하지 못하게(artist 패턴).
    const { data: existing, error: loadError } = await supabase
      .from("tours")
      .select("slug, poster_path, updated_at")
      .eq("id", id)
      .eq("site_slug", site)
      .maybeSingle();
    if (loadError) return { ok: false, error: loadError.message };
    if (!existing) return { ok: false, error: "투어를 찾을 수 없습니다." };

    // 낙관적 동시성 1차 검사: 폼이 로드했던 updated_at과 현재 행이 다르면 그사이
    // 다른 곳에서 저장된 것 — last-write-wins로 덮어쓰기 전에, 그리고 이미지 업로드
    // 같은 부수효과가 시작되기 전에 끊는다. 값이 없으면(구 폼) 검사를 건너뛴다.
    const expectedUpdatedAt = formData.get("expectedUpdatedAt");
    if (
      typeof expectedUpdatedAt === "string" &&
      expectedUpdatedAt !== existing.updated_at
    ) {
      return { ok: false, error: CONCURRENT_EDIT_MESSAGE };
    }

    const artistError = await assertArtistInSite(
      supabase,
      columns.artist_id ?? null,
      site,
    );
    if (artistError)
      return { ok: false, error: artistError, field: "artistId" };

    const poster = imageFile(formData, "posterImage");
    const posterUpload = poster
      ? await uploadEntityImage(
          supabase,
          "tour",
          site,
          existing.slug,
          "poster",
          poster,
        )
      : null;

    // 새 파일 없이 제거만 요청한 경우(폼의 "제거" 버튼) — 컬럼을 비운다.
    const removePoster = !poster && imageRemoved(formData, "removePosterImage");

    // 새 파일이 온 이미지 컬럼만 갱신, 없으면 기존값 유지.
    const imageColumns: Database["public"]["Tables"]["tours"]["Update"] = {};
    if (posterUpload) {
      imageColumns.poster_path = posterUpload.path;
      imageColumns.poster_placeholder = posterUpload.placeholder;
    } else if (removePoster) {
      imageColumns.poster_path = null;
      imageColumns.poster_placeholder = null;
    }

    // updated_at 매치 조건이 2차(레이스) 검사다: 위 1차 검사 후 이 update 사이에 다른
    // 저장이 끼어들면 트리거가 updated_at을 바꿔 매치 0건이 된다 — select("id")로 실제
    // 갱신 행 수를 확인해 0건을 충돌로 처리한다.
    const { data: updated, error } = await supabase
      .from("tours")
      .update({ ...columns, ...imageColumns })
      .eq("id", id)
      .eq("site_slug", site)
      .eq("updated_at", existing.updated_at)
      .select("id");
    if (error) {
      await removeUploadedOrphans(supabase, id, posterUpload?.path);
      return { ok: false, error: error.message };
    }
    if (!updated || updated.length === 0) {
      await removeUploadedOrphans(supabase, id, posterUpload?.path);
      return { ok: false, error: CONCURRENT_EDIT_MESSAGE };
    }

    // 교체·제거된 이전 포스터 삭제(best-effort, DB 갱신 뒤라 실패해도 컬럼은 이미 비어 있다).
    // 새 경로와 동일하면(동일 콘텐츠 해시) 방금 올린 파일을 지우게 되므로 제외한다.
    const oldPosterPath =
      (posterUpload && existing.poster_path !== posterUpload.path) ||
      removePoster
        ? existing.poster_path
        : null;
    await removeImages(supabase, [oldPosterPath]);

    const publishWarning = await publishOrWarn([contentTags.tours(site)], site);
    revalidateTours(site, id);
    return publishWarning
      ? { ok: true, id, warning: publishWarning }
      : { ok: true, id };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}

export async function deleteTour(
  siteInput: string,
  id: string,
): Promise<EntityActionResult> {
  try {
    const site = siteSlugSchema.parse(siteInput);
    const supabase = await createServerSupabaseClient();

    // 이미지 경로를 먼저 읽어 행 삭제 후 Storage best-effort 정리.
    // site_slug 스코프: 타 사이트 투어 삭제 차단(artist 패턴).
    const { data: existing, error: loadError } = await supabase
      .from("tours")
      .select("poster_path")
      .eq("id", id)
      .eq("site_slug", site)
      .maybeSingle();
    // 조회 순단을 "행 없음"으로 오인하면 삭제만 성공하고 발행·Storage 정리가
    // 스킵돼 삭제된 콘텐츠가 사이트 캐시에 영구 잔존한다(TTL 없음) — 삭제 전 중단.
    if (loadError) return { ok: false, error: loadError.message };

    const { error } = await supabase
      .from("tours")
      .delete()
      .eq("id", id)
      .eq("site_slug", site);
    if (error) return { ok: false, error: error.message };

    // 행이 없었다면 무효화할 캐시도 없다 — 실제 삭제가 일어난 경우에만 발행.
    let publishWarning: string | null = null;
    if (existing) {
      await removeImages(supabase, [existing.poster_path]);
      publishWarning = await publishOrWarn(
        [contentTags.tours(site)],
        site,
        "delete",
      );
    }

    revalidateTours(site);
    return publishWarning ? { ok: true, warning: publishWarning } : { ok: true };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}
