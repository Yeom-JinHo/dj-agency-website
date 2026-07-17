"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@repo/content/supabase/server";
import type { Database } from "@repo/content/supabase/types";

import { slugify } from "@/lib/media";
import {
  imageFile,
  removeImages,
  uploadEntityImage,
  validateImageFile,
} from "@/lib/entity-media";
import { syncEntitySites } from "@/lib/entity-sites";
import { artistFormSchema, formValuesToDbInput } from "./schema";

export type ArtistActionResult =
  | { ok: true; id?: string; warning?: string }
  | { ok: false; error: string };

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export async function createArtist(
  formData: FormData,
): Promise<ArtistActionResult> {
  try {
    const values = artistFormSchema.parse(
      JSON.parse(String(formData.get("payload"))),
    );
    const { columns, sites } = formValuesToDbInput(values);

    const slug = slugify(values.name);
    if (!slug) {
      return { ok: false, error: "이름에서 slug를 만들 수 없습니다." };
    }

    // createServerSupabaseClient는 인증 세션을 실어 RLS(editors)가 서버측 방어로 동작.
    const supabase = await createServerSupabaseClient();

    // 이미지 유효성은 행 생성 전에 검사 — 불량 입력이 행을 만들지 않게.
    const profile = imageFile(formData, "profileImage");
    const logo = imageFile(formData, "logoImage");
    if (profile) validateImageFile(profile);
    if (logo) validateImageFile(logo);

    // insert-first: slug 확보를 먼저 해 이름 중복(23505) 같은 흔한 실패에서 Storage
    // 고아를 막고 update 경로와 대칭이 되게 한다.
    const { data, error } = await supabase
      .from("artists")
      .insert({ slug, ...columns })
      .select("id")
      .single();
    if (error) {
      const message =
        error.code === "23505"
          ? `slug "${slug}"가 이미 존재합니다(이름 중복).`
          : error.message;
      return { ok: false, error: message };
    }
    const id = data.id;

    // 행 생성 이후 단계(이미지 업로드 → image 컬럼 update → sites 동기화).
    // 여기서 실패해도 행은 이미 존재하므로 삭제하지 않고 편집 화면으로 안내(dead-end 회피).
    try {
      const profileUpload = profile
        ? await uploadEntityImage(supabase, "artist", slug, "profile", profile)
        : null;
      const logoUpload = logo
        ? await uploadEntityImage(supabase, "artist", slug, "logo", logo)
        : null;

      if (profileUpload || logoUpload) {
        const imageColumns: Database["public"]["Tables"]["artists"]["Update"] =
          {};
        if (profileUpload) {
          imageColumns.image_path = profileUpload.path;
          imageColumns.image_placeholder = profileUpload.placeholder;
        }
        if (logoUpload) {
          imageColumns.logo_image_path = logoUpload.path;
        }
        const { error: updateError } = await supabase
          .from("artists")
          .update(imageColumns)
          .eq("id", id);
        if (updateError) throw new Error(updateError.message);
      }

      await syncEntitySites(supabase, "artist_sites", "artist_id", id, sites);
    } catch (postError) {
      // P3: publish(tags, sites) 연결 지점
      revalidatePath("/artists");
      return {
        ok: true,
        id,
        warning: `아티스트는 생성됐지만 일부 저장에 실패했습니다(${toErrorMessage(postError)}). 편집 화면에서 이미지·사이트 노출을 다시 저장해주세요.`,
      };
    }

    // P3: publish(tags, sites) 연결 지점
    revalidatePath("/artists");
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}

export async function updateArtist(
  id: string,
  formData: FormData,
): Promise<ArtistActionResult> {
  try {
    const values = artistFormSchema.parse(
      JSON.parse(String(formData.get("payload"))),
    );
    const { columns, sites } = formValuesToDbInput(values);

    const supabase = await createServerSupabaseClient();

    // slug는 불변(§13) — 기존 행에서 읽어 이미지 경로 조립·교체 삭제에 사용.
    const { data: existing, error: loadError } = await supabase
      .from("artists")
      .select("slug, image_path, logo_image_path")
      .eq("id", id)
      .maybeSingle();
    if (loadError) return { ok: false, error: loadError.message };
    if (!existing) return { ok: false, error: "아티스트를 찾을 수 없습니다." };

    const profile = imageFile(formData, "profileImage");
    const logo = imageFile(formData, "logoImage");
    const profileUpload = profile
      ? await uploadEntityImage(
          supabase,
          "artist",
          existing.slug,
          "profile",
          profile,
        )
      : null;
    const logoUpload = logo
      ? await uploadEntityImage(supabase, "artist", existing.slug, "logo", logo)
      : null;

    // 새 파일이 온 이미지 컬럼만 갱신, 없으면 기존값 유지.
    const imageColumns: Database["public"]["Tables"]["artists"]["Update"] = {};
    if (profileUpload) {
      imageColumns.image_path = profileUpload.path;
      imageColumns.image_placeholder = profileUpload.placeholder;
    }
    if (logoUpload) {
      imageColumns.logo_image_path = logoUpload.path;
    }

    const { error } = await supabase
      .from("artists")
      .update({ ...columns, ...imageColumns })
      .eq("id", id);
    if (error) return { ok: false, error: error.message };

    await syncEntitySites(supabase, "artist_sites", "artist_id", id, sites);

    // 교체된 이전 이미지 삭제(best-effort). 새 경로와 동일하면(동일 콘텐츠 해시)
    // 방금 올린 파일을 지우게 되므로 제외한다.
    const oldProfilePath =
      profileUpload &&
      existing.image_path &&
      existing.image_path !== profileUpload.path
        ? existing.image_path
        : null;
    const oldLogoPath =
      logoUpload &&
      existing.logo_image_path &&
      existing.logo_image_path !== logoUpload.path
        ? existing.logo_image_path
        : null;
    await removeImages(supabase, [oldProfilePath, oldLogoPath]);

    // P3: publish(tags, sites) 연결 지점
    revalidatePath("/artists");
    revalidatePath(`/artists/${id}`);
    return { ok: true, id };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}

export async function deleteArtist(id: string): Promise<ArtistActionResult> {
  try {
    const supabase = await createServerSupabaseClient();

    // 이미지 경로를 먼저 읽어 행 삭제 후 Storage best-effort 정리.
    const { data: existing } = await supabase
      .from("artists")
      .select("image_path, logo_image_path")
      .eq("id", id)
      .maybeSingle();

    // artist_sites는 FK on delete cascade로 자동 정리.
    const { error } = await supabase.from("artists").delete().eq("id", id);
    if (error) return { ok: false, error: error.message };

    if (existing) {
      await removeImages(supabase, [
        existing.image_path,
        existing.logo_image_path,
      ]);
    }

    // P3: publish(tags, sites) 연결 지점
    revalidatePath("/artists");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}
