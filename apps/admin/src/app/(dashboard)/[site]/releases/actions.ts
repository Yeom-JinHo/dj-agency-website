"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@repo/content/supabase/server";
import type { Database } from "@repo/content/supabase/types";
import { siteSlugSchema } from "@repo/content/schema";
import { contentTags } from "@repo/content/tags";

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
import { releaseFormSchema, formValuesToDbInput } from "./schema";

/**
 * primary_artist_id same-site 검증: select UI는 같은 사이트만 노출하지만(클라이언트 방어)
 * FK는 존재만 검사하므로, 타 사이트 아티스트 uuid를 직접 넣는 우회를 서버에서 차단한다.
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

export async function createRelease(
  siteInput: string,
  formData: FormData,
): Promise<EntityActionResult<"title" | "primaryArtistId">> {
  try {
    // 라우트에서 온 site를 서버측에서 재검증(신뢰 경계) — artist/tour 액션과 동일 패턴.
    const site = siteSlugSchema.parse(siteInput);
    const values = releaseFormSchema.parse(
      JSON.parse(String(formData.get("payload"))),
    );
    const { columns } = formValuesToDbInput(values);

    const slug = slugify(values.title);
    if (!slug) {
      // slug는 제목에서만 파생되므로 고칠 곳은 항상 title 필드다.
      return {
        ok: false,
        error: "제목에서 slug를 만들 수 없습니다.",
        field: "title",
      };
    }

    const publishTags = [contentTags.release(site, slug), contentTags.releases(site)];

    // createServerSupabaseClient는 인증 세션을 실어 RLS(editors)가 서버측 방어로 동작.
    const supabase = await createServerSupabaseClient();

    // 이미지 유효성은 행 생성 전에 검사 — 불량 입력이 행을 만들지 않게.
    const artwork = imageFile(formData, "artworkImage");
    if (artwork) validateImageFile(artwork);

    const artistError = await assertArtistInSite(
      supabase,
      columns.primary_artist_id ?? null,
      site,
    );
    if (artistError)
      return { ok: false, error: artistError, field: "primaryArtistId" };

    // insert-first: slug 확보를 먼저 해 (site_slug, slug) 중복(23505) 같은 흔한
    // 실패에서 Storage 고아를 막고 update 경로와 대칭이 되게 한다.
    // 소속 모델(§8): site_slug는 라우트에서 결정 — 폼이 아니라 여기서 지정.
    const { data, error } = await supabase
      .from("releases")
      .insert({ slug, site_slug: site, ...columns })
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

    // 행 생성 이후 단계(이미지 업로드 → artwork 컬럼 update).
    // 여기서 실패해도 행은 이미 존재하므로 삭제하지 않고 편집 화면으로 안내(dead-end 회피).
    // 업로드 결과는 catch에서도 보여야 한다(컬럼 update 실패 시 업로드된 파일 보상 삭제).
    let artworkUpload: { path: string; placeholder: string } | null = null;
    try {
      artworkUpload = artwork
        ? await uploadEntityImage(
            supabase,
            "release",
            site,
            slug,
            "artwork",
            artwork,
          )
        : null;

      if (artworkUpload) {
        const imageColumns: Database["public"]["Tables"]["releases"]["Update"] =
          {
            artwork_path: artworkUpload.path,
            artwork_placeholder: artworkUpload.placeholder,
          };
        const { error: updateError } = await supabase
          .from("releases")
          .update(imageColumns)
          .eq("id", id);
        if (updateError) throw new Error(updateError.message);
      }
    } catch (postError) {
      // 업로드까지 됐지만 컬럼 update가 실패한 파일은 어떤 행도 참조하지 않는 고아 —
      // 편집 화면 재저장 시 같은 콘텐츠면 같은 해시 경로로 다시 올라가므로 지워도 안전.
      await removeImages(supabase, [artworkUpload?.path]);
      // 행은 저장됐으니 아트워크 없이라도 사이트에 반영(발행). 발행 경고는 아트워크 경고에 덧붙인다.
      const publishWarning = await publishOrWarn(publishTags, site);
      revalidatePath(`/${site}/releases`);
      const imageWarning = `릴리즈는 생성됐지만 일부 저장에 실패했습니다(${toErrorMessage(postError)}). 편집 화면에서 아트워크를 다시 저장해주세요.`;
      return {
        ok: true,
        id,
        warning: publishWarning ? `${imageWarning} ${publishWarning}` : imageWarning,
      };
    }

    const publishWarning = await publishOrWarn(publishTags, site);
    revalidatePath(`/${site}/releases`);
    return publishWarning
      ? { ok: true, id, warning: publishWarning }
      : { ok: true, id };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}

export async function updateRelease(
  siteInput: string,
  id: string,
  formData: FormData,
): Promise<EntityActionResult<"primaryArtistId">> {
  try {
    const site = siteSlugSchema.parse(siteInput);
    const values = releaseFormSchema.parse(
      JSON.parse(String(formData.get("payload"))),
    );
    const { columns } = formValuesToDbInput(values);

    const supabase = await createServerSupabaseClient();

    // slug·site_slug는 불변(§8/§13) — 기존 행에서 slug를 읽어 이미지 경로 조립·교체 삭제에 사용.
    // site_slug 스코프: 타 사이트 릴리즈를 이 site 컨텍스트로 조작하지 못하게(artist 패턴).
    const { data: existing, error: loadError } = await supabase
      .from("releases")
      .select("slug, artwork_path, updated_at")
      .eq("id", id)
      .eq("site_slug", site)
      .maybeSingle();
    if (loadError) return { ok: false, error: loadError.message };
    if (!existing) return { ok: false, error: "릴리즈를 찾을 수 없습니다." };

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
      columns.primary_artist_id ?? null,
      site,
    );
    if (artistError)
      return { ok: false, error: artistError, field: "primaryArtistId" };

    const artwork = imageFile(formData, "artworkImage");
    const artworkUpload = artwork
      ? await uploadEntityImage(
          supabase,
          "release",
          site,
          existing.slug,
          "artwork",
          artwork,
        )
      : null;

    // 새 파일 없이 제거만 요청한 경우(폼의 "제거" 버튼) — 컬럼을 비운다.
    const removeArtwork =
      !artwork && imageRemoved(formData, "removeArtworkImage");

    // 새 파일이 온 이미지 컬럼만 갱신, 없으면 기존값 유지.
    const imageColumns: Database["public"]["Tables"]["releases"]["Update"] = {};
    if (artworkUpload) {
      imageColumns.artwork_path = artworkUpload.path;
      imageColumns.artwork_placeholder = artworkUpload.placeholder;
    } else if (removeArtwork) {
      imageColumns.artwork_path = null;
      imageColumns.artwork_placeholder = null;
    }

    // update 실패 시 방금 올린 새 아트워크는 어떤 행도 참조하지 않는 고아 — 보상 삭제
    // 대상. 기존 경로와 같으면(동일 콘텐츠 해시, upsert) 라이브 파일이므로 제외한다.
    const uploadedOrphanPaths = [
      artworkUpload && artworkUpload.path !== existing.artwork_path
        ? artworkUpload.path
        : null,
    ];

    // site_slug·slug는 update 대상에서 제외(불변) — columns에 둘 다 없음.
    // updated_at 매치 조건이 2차(레이스) 검사다: 위 1차 검사 후 이 update 사이에 다른
    // 저장이 끼어들면 트리거가 updated_at을 바꿔 매치 0건이 된다 — select("id")로 실제
    // 갱신 행 수를 확인해 0건을 충돌로 처리한다.
    const { data: updated, error } = await supabase
      .from("releases")
      .update({ ...columns, ...imageColumns })
      .eq("id", id)
      .eq("site_slug", site)
      .eq("updated_at", existing.updated_at)
      .select("id");
    if (error) {
      await removeImages(supabase, uploadedOrphanPaths);
      return { ok: false, error: error.message };
    }
    if (!updated || updated.length === 0) {
      await removeImages(supabase, uploadedOrphanPaths);
      return { ok: false, error: CONCURRENT_EDIT_MESSAGE };
    }

    // 교체·제거된 이전 이미지 삭제(best-effort, DB 갱신 뒤라 실패해도 컬럼은 이미 비어 있다).
    // 새 경로와 동일하면(동일 콘텐츠 해시) 방금 올린 파일을 지우게 되므로 제외한다.
    const oldArtworkPath =
      (artworkUpload && existing.artwork_path !== artworkUpload.path) ||
      removeArtwork
        ? existing.artwork_path
        : null;
    await removeImages(supabase, [oldArtworkPath]);

    const publishWarning = await publishOrWarn(
      [contentTags.release(site, existing.slug), contentTags.releases(site)],
      site,
    );
    revalidatePath(`/${site}/releases`);
    revalidatePath(`/${site}/releases/${id}`);
    return publishWarning
      ? { ok: true, id, warning: publishWarning }
      : { ok: true, id };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}

export async function deleteRelease(
  siteInput: string,
  id: string,
): Promise<EntityActionResult> {
  try {
    const site = siteSlugSchema.parse(siteInput);
    const supabase = await createServerSupabaseClient();

    // slug는 삭제된 상세 캐시 태그에, artwork_path는 Storage 정리에 쓴다.
    // site_slug 스코프: 타 사이트 릴리즈 삭제 차단(artist 패턴).
    const { data: existing, error: loadError } = await supabase
      .from("releases")
      .select("slug, artwork_path")
      .eq("id", id)
      .eq("site_slug", site)
      .maybeSingle();
    // 조회 순단을 "행 없음"으로 오인하면 삭제만 성공하고 발행·Storage 정리가
    // 스킵돼 삭제된 콘텐츠가 사이트 캐시에 영구 잔존한다(TTL 없음) — 삭제 전 중단.
    if (loadError) return { ok: false, error: loadError.message };

    const { error } = await supabase
      .from("releases")
      .delete()
      .eq("id", id)
      .eq("site_slug", site);
    if (error) return { ok: false, error: error.message };

    // 행이 없었다면 무효화할 캐시도 없다 — 실제 삭제가 일어난 경우에만 발행.
    let publishWarning: string | null = null;
    if (existing) {
      await removeImages(supabase, [existing.artwork_path]);
      // 삭제된 상세 태그 포함 — 상세 페이지 캐시까지 무효화.
      publishWarning = await publishOrWarn(
        [contentTags.release(site, existing.slug), contentTags.releases(site)],
        site,
        "delete",
      );
    }

    revalidatePath(`/${site}/releases`);
    return publishWarning ? { ok: true, warning: publishWarning } : { ok: true };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}
