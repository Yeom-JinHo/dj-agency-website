"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@repo/content/supabase/server";
import type { Database } from "@repo/content/supabase/types";
import { siteSlugSchema } from "@repo/content/schema";

import { slugify } from "@/lib/media";
import {
  imageFile,
  removeImages,
  uploadEntityImage,
  validateImageFile,
} from "@/lib/entity-media";
import { releaseFormSchema, formValuesToDbInput } from "./schema";

export type ReleaseActionResult =
  | { ok: true; id?: string; warning?: string }
  | { ok: false; error: string };

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

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
): Promise<ReleaseActionResult> {
  try {
    // 라우트에서 온 site를 서버측에서 재검증(신뢰 경계) — artist/tour 액션과 동일 패턴.
    const site = siteSlugSchema.parse(siteInput);
    const values = releaseFormSchema.parse(
      JSON.parse(String(formData.get("payload"))),
    );
    const { columns } = formValuesToDbInput(values);

    const slug = slugify(values.title);
    if (!slug) {
      return { ok: false, error: "제목에서 slug를 만들 수 없습니다." };
    }

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
    if (artistError) return { ok: false, error: artistError };

    // insert-first: slug 확보를 먼저 해 (site_slug, slug) 중복(23505) 같은 흔한
    // 실패에서 Storage 고아를 막고 update 경로와 대칭이 되게 한다.
    // 소속 모델(§8): site_slug는 라우트에서 결정 — 폼이 아니라 여기서 지정.
    const { data, error } = await supabase
      .from("releases")
      .insert({ slug, site_slug: site, ...columns })
      .select("id")
      .single();
    if (error) {
      const message =
        error.code === "23505"
          ? `slug "${slug}"가 이미 존재합니다(사이트 내 제목 중복).`
          : error.message;
      return { ok: false, error: message };
    }
    const id = data.id;

    // 행 생성 이후 단계(이미지 업로드 → artwork 컬럼 update).
    // 여기서 실패해도 행은 이미 존재하므로 삭제하지 않고 편집 화면으로 안내(dead-end 회피).
    try {
      const artworkUpload = artwork
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
      // P3 앵커: publish 시 contentTags.releases(site)·contentTags.release(site, slug) 무효화.
      revalidatePath(`/${site}/releases`);
      return {
        ok: true,
        id,
        warning: `릴리즈는 생성됐지만 일부 저장에 실패했습니다(${toErrorMessage(postError)}). 편집 화면에서 아트워크를 다시 저장해주세요.`,
      };
    }

    // P3 앵커: publish 시 contentTags.releases(site)·contentTags.release(site, slug) 무효화.
    revalidatePath(`/${site}/releases`);
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}

export async function updateRelease(
  siteInput: string,
  id: string,
  formData: FormData,
): Promise<ReleaseActionResult> {
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
      .select("slug, artwork_path")
      .eq("id", id)
      .eq("site_slug", site)
      .maybeSingle();
    if (loadError) return { ok: false, error: loadError.message };
    if (!existing) return { ok: false, error: "릴리즈를 찾을 수 없습니다." };

    const artistError = await assertArtistInSite(
      supabase,
      columns.primary_artist_id ?? null,
      site,
    );
    if (artistError) return { ok: false, error: artistError };

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

    // 새 파일이 온 이미지 컬럼만 갱신, 없으면 기존값 유지.
    const imageColumns: Database["public"]["Tables"]["releases"]["Update"] = {};
    if (artworkUpload) {
      imageColumns.artwork_path = artworkUpload.path;
      imageColumns.artwork_placeholder = artworkUpload.placeholder;
    }

    // site_slug·slug는 update 대상에서 제외(불변) — columns에 둘 다 없음.
    const { error } = await supabase
      .from("releases")
      .update({ ...columns, ...imageColumns })
      .eq("id", id)
      .eq("site_slug", site);
    if (error) return { ok: false, error: error.message };

    // 교체된 이전 이미지 삭제(best-effort). 새 경로와 동일하면(동일 콘텐츠 해시)
    // 방금 올린 파일을 지우게 되므로 제외한다.
    const oldArtworkPath =
      artworkUpload &&
      existing.artwork_path &&
      existing.artwork_path !== artworkUpload.path
        ? existing.artwork_path
        : null;
    await removeImages(supabase, [oldArtworkPath]);

    // P3 앵커: publish 시 contentTags.releases(site)·contentTags.release(site, existing.slug) 무효화.
    revalidatePath(`/${site}/releases`);
    revalidatePath(`/${site}/releases/${id}`);
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}

export async function deleteRelease(
  siteInput: string,
  id: string,
): Promise<ReleaseActionResult> {
  try {
    const site = siteSlugSchema.parse(siteInput);
    const supabase = await createServerSupabaseClient();

    // 이미지 경로를 먼저 읽어 행 삭제 후 Storage best-effort 정리.
    // site_slug 스코프: 타 사이트 릴리즈 삭제 차단(artist 패턴).
    const { data: existing } = await supabase
      .from("releases")
      .select("artwork_path")
      .eq("id", id)
      .eq("site_slug", site)
      .maybeSingle();

    const { error } = await supabase
      .from("releases")
      .delete()
      .eq("id", id)
      .eq("site_slug", site);
    if (error) return { ok: false, error: error.message };

    if (existing) {
      await removeImages(supabase, [existing.artwork_path]);
    }

    // P3 앵커: publish 시 contentTags.releases(site) 무효화.
    revalidatePath(`/${site}/releases`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}
