"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@repo/content/supabase/server";
import { siteSlugSchema, type SiteSlug } from "@repo/content/schema";
import type { Database } from "@repo/content/supabase/types";

import { slugify } from "@/lib/media";
import {
  imageFile,
  removeImages,
  uploadEntityImage,
  validateImageFile,
} from "@/lib/entity-media";
import { tourFormSchema, formValuesToDbColumns } from "./schema";

export type TourActionResult =
  | { ok: true; id?: string; warning?: string }
  | { ok: false; error: string };

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

/**
 * admin 자신의 사이트-스코프 라우트 revalidate.
 * P3: publish(contentTags.tours(site) 등, site) 연결 지점 — 사이트 앱의 태그 캐시는
 * 별개 배포라 여기서 revalidateTag를 불러도 무효화되지 않는다. 반드시 publish 헬퍼가
 * 각 사이트 /api/revalidate로 POST해야 하며, 태그는 contentTags 빌더로만 조립한다.
 */
function revalidateTours(site: SiteSlug, id?: string): void {
  revalidatePath(`/${site}/tours`);
  if (id) revalidatePath(`/${site}/tours/${id}`);
}

export async function createTour(
  siteInput: string,
  formData: FormData,
): Promise<TourActionResult> {
  try {
    // 라우트에서 온 site를 서버측에서 재검증(신뢰 경계) — 소속 모델은 site_slug 자동 부여.
    const site = siteSlugSchema.parse(siteInput);
    const values = tourFormSchema.parse(
      JSON.parse(String(formData.get("payload"))),
    );
    const columns = formValuesToDbColumns(values);

    const slug = slugify(values.title);
    if (!slug) {
      return { ok: false, error: "제목에서 slug를 만들 수 없습니다." };
    }

    // createServerSupabaseClient는 인증 세션을 실어 RLS(editors)가 서버측 방어로 동작.
    const supabase = await createServerSupabaseClient();

    // 이미지 유효성은 행 생성 전에 검사 — 불량 입력이 행을 만들지 않게.
    const poster = imageFile(formData, "posterImage");
    if (poster) validateImageFile(poster);

    // insert-first: (site_slug, slug) 확보를 먼저 해 사이트 내 제목 중복(23505)에서
    // Storage 고아를 막고 update 경로와 대칭이 되게 한다.
    const { data, error } = await supabase
      .from("tours")
      .insert({ site_slug: site, slug, ...columns })
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

    // 행 생성 이후 단계(포스터 업로드 → poster 컬럼 update). 여기서 실패해도 행은
    // 이미 존재하므로 삭제하지 않고 편집 화면으로 안내(dead-end 회피).
    try {
      const posterUpload = poster
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
      revalidateTours(site, id);
      return {
        ok: true,
        id,
        warning: `투어는 생성됐지만 포스터 저장에 실패했습니다(${toErrorMessage(postError)}). 편집 화면에서 포스터를 다시 저장해주세요.`,
      };
    }

    revalidateTours(site, id);
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}

export async function updateTour(
  siteInput: string,
  id: string,
  formData: FormData,
): Promise<TourActionResult> {
  try {
    const site = siteSlugSchema.parse(siteInput);
    const values = tourFormSchema.parse(
      JSON.parse(String(formData.get("payload"))),
    );
    const columns = formValuesToDbColumns(values);

    const supabase = await createServerSupabaseClient();

    // slug·site_slug는 불변(§13) — 기존 행에서 slug를 읽어 이미지 경로 조립·교체
    // 삭제에 쓴다. update 컬럼에는 slug/site_slug를 넣지 않는다.
    const { data: existing, error: loadError } = await supabase
      .from("tours")
      .select("slug, poster_path")
      .eq("id", id)
      .maybeSingle();
    if (loadError) return { ok: false, error: loadError.message };
    if (!existing) return { ok: false, error: "투어를 찾을 수 없습니다." };

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

    // 새 파일이 온 이미지 컬럼만 갱신, 없으면 기존값 유지.
    const imageColumns: Database["public"]["Tables"]["tours"]["Update"] = {};
    if (posterUpload) {
      imageColumns.poster_path = posterUpload.path;
      imageColumns.poster_placeholder = posterUpload.placeholder;
    }

    const { error } = await supabase
      .from("tours")
      .update({ ...columns, ...imageColumns })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    // 교체된 이전 포스터 삭제(best-effort). 새 경로와 동일하면(동일 콘텐츠 해시)
    // 방금 올린 파일을 지우게 되므로 제외한다.
    const oldPosterPath =
      posterUpload &&
      existing.poster_path &&
      existing.poster_path !== posterUpload.path
        ? existing.poster_path
        : null;
    await removeImages(supabase, [oldPosterPath]);

    revalidateTours(site, id);
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}

export async function deleteTour(
  siteInput: string,
  id: string,
): Promise<TourActionResult> {
  try {
    const site = siteSlugSchema.parse(siteInput);
    const supabase = await createServerSupabaseClient();

    // 이미지 경로를 먼저 읽어 행 삭제 후 Storage best-effort 정리.
    const { data: existing } = await supabase
      .from("tours")
      .select("poster_path")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase.from("tours").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    if (existing) {
      await removeImages(supabase, [existing.poster_path]);
    }

    revalidateTours(site);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}
