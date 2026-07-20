"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@repo/content/supabase/server";
import { siteSlugSchema, type SiteSlug } from "@repo/content/schema";
import { contentTags } from "@repo/content/tags";
import type { Database } from "@repo/content/supabase/types";

import { publishOrWarn } from "@/lib/publish";
import { slugify } from "@/lib/media";
import {
  imageFile,
  removeImages,
  uploadEntityImage,
  validateImageFile,
} from "@/lib/entity-media";
import { artistFormSchema, formValuesToDbColumns } from "./schema";

export type ArtistActionResult =
  | { ok: true; id?: string; warning?: string }
  | { ok: false; error: string };

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export async function createArtist(
  siteParam: SiteSlug,
  formData: FormData,
): Promise<ArtistActionResult> {
  try {
    // 소속 사이트는 라우트 세그먼트에서 결정 — 서버측에서도 유효성 방어.
    const site = siteSlugSchema.parse(siteParam);
    const values = artistFormSchema.parse(
      JSON.parse(String(formData.get("payload"))),
    );
    const columns = formValuesToDbColumns(values);

    const slug = slugify(values.name);
    if (!slug) {
      return { ok: false, error: "이름에서 slug를 만들 수 없습니다." };
    }

    // 아티스트명은 릴리즈·투어 표시에 쓰이므로 교차 엔티티 리스트 태그도 무효화(§13 🔴).
    const publishTags = [
      contentTags.artist(site, slug),
      contentTags.artists(site),
      contentTags.releases(site),
      contentTags.tours(site),
    ];

    // createServerSupabaseClient는 인증 세션을 실어 RLS(editors)가 서버측 방어로 동작.
    const supabase = await createServerSupabaseClient();

    // 이미지 유효성은 행 생성 전에 검사 — 불량 입력이 행을 만들지 않게.
    const profile = imageFile(formData, "profileImage");
    const logo = imageFile(formData, "logoImage");
    if (profile) validateImageFile(profile);
    if (logo) validateImageFile(logo);

    // insert-first: slug 확보를 먼저 해 이름 중복(23505) 같은 흔한 실패에서 Storage
    // 고아를 막고 update 경로와 대칭이 되게 한다. site_slug는 라우트에서 자동.
    const { data, error } = await supabase
      .from("artists")
      .insert({ site_slug: site, slug, ...columns })
      .select("id")
      .single();
    if (error) {
      const message =
        error.code === "23505"
          ? `이 사이트에 slug "${slug}"가 이미 존재합니다(이름 중복).`
          : error.message;
      return { ok: false, error: message };
    }
    const id = data.id;

    // 행 생성 이후 단계(이미지 업로드 → image 컬럼 update).
    // 여기서 실패해도 행은 이미 존재하므로 삭제하지 않고 편집 화면으로 안내(dead-end 회피).
    try {
      const profileUpload = profile
        ? await uploadEntityImage(
            supabase,
            "artist",
            site,
            slug,
            "profile",
            profile,
          )
        : null;
      const logoUpload = logo
        ? await uploadEntityImage(supabase, "artist", site, slug, "logo", logo)
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
    } catch (postError) {
      // 행은 저장됐으니 이미지 없이라도 사이트에 반영(발행). 발행 경고는 이미지 경고에 덧붙인다.
      const publishWarning = await publishOrWarn(publishTags, site);
      revalidatePath(`/${site}/artists`);
      const imageWarning = `아티스트는 생성됐지만 이미지 저장에 실패했습니다(${toErrorMessage(postError)}). 편집 화면에서 이미지를 다시 저장해주세요.`;
      return {
        ok: true,
        id,
        warning: publishWarning ? `${imageWarning} ${publishWarning}` : imageWarning,
      };
    }

    const publishWarning = await publishOrWarn(publishTags, site);
    revalidatePath(`/${site}/artists`);
    return publishWarning
      ? { ok: true, id, warning: publishWarning }
      : { ok: true, id };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}

export async function updateArtist(
  siteParam: SiteSlug,
  id: string,
  formData: FormData,
): Promise<ArtistActionResult> {
  try {
    const site = siteSlugSchema.parse(siteParam);
    const values = artistFormSchema.parse(
      JSON.parse(String(formData.get("payload"))),
    );
    const columns = formValuesToDbColumns(values);

    const supabase = await createServerSupabaseClient();

    // slug·site_slug는 불변(§13) — 기존 행에서 slug를 읽어 이미지 경로 조립·교체 삭제에 사용.
    const { data: existing, error: loadError } = await supabase
      .from("artists")
      .select("slug, image_path, logo_image_path")
      .eq("id", id)
      .eq("site_slug", site)
      .maybeSingle();
    if (loadError) return { ok: false, error: loadError.message };
    if (!existing) return { ok: false, error: "아티스트를 찾을 수 없습니다." };

    const profile = imageFile(formData, "profileImage");
    const logo = imageFile(formData, "logoImage");
    const profileUpload = profile
      ? await uploadEntityImage(
          supabase,
          "artist",
          site,
          existing.slug,
          "profile",
          profile,
        )
      : null;
    const logoUpload = logo
      ? await uploadEntityImage(
          supabase,
          "artist",
          site,
          existing.slug,
          "logo",
          logo,
        )
      : null;

    // 새 파일이 온 이미지 컬럼만 갱신, 없으면 기존값 유지. site_slug·slug는 컬럼에서 제외(불변).
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

    // 아티스트명 변경이 릴리즈·투어 표시에 반영되도록 교차 엔티티 태그도 무효화(§13 🔴).
    const publishWarning = await publishOrWarn(
      [
        contentTags.artist(site, existing.slug),
        contentTags.artists(site),
        contentTags.releases(site),
        contentTags.tours(site),
      ],
      site,
    );
    revalidatePath(`/${site}/artists`);
    revalidatePath(`/${site}/artists/${id}`);
    return publishWarning
      ? { ok: true, id, warning: publishWarning }
      : { ok: true, id };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}

export async function deleteArtist(
  siteParam: SiteSlug,
  id: string,
): Promise<ArtistActionResult> {
  try {
    const site = siteSlugSchema.parse(siteParam);
    const supabase = await createServerSupabaseClient();

    // slug는 삭제된 상세 페이지 캐시 태그 조립에, 이미지 경로는 Storage 정리에 쓴다.
    const { data: existing } = await supabase
      .from("artists")
      .select("slug, image_path, logo_image_path")
      .eq("id", id)
      .eq("site_slug", site)
      .maybeSingle();

    const { error } = await supabase
      .from("artists")
      .delete()
      .eq("id", id)
      .eq("site_slug", site);
    if (error) return { ok: false, error: error.message };

    // 행이 없었다면 무효화할 캐시도 없다 — 실제 삭제가 일어난 경우에만 발행.
    let publishWarning: string | null = null;
    if (existing) {
      await removeImages(supabase, [
        existing.image_path,
        existing.logo_image_path,
      ]);
      // 삭제된 상세 태그 포함 — 상세 페이지 캐시까지 무효화(§13 🔴 교차 엔티티).
      publishWarning = await publishOrWarn(
        [
          contentTags.artist(site, existing.slug),
          contentTags.artists(site),
          contentTags.releases(site),
          contentTags.tours(site),
        ],
        site,
      );
    }

    revalidatePath(`/${site}/artists`);
    return publishWarning ? { ok: true, warning: publishWarning } : { ok: true };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}
