"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@repo/content/supabase/server";
import { siteSlugSchema, type SiteSlug } from "@repo/content/schema";
import { contentTags } from "@repo/content/tags";
import type { Database } from "@repo/content/supabase/types";

import { assertSiteAccess } from "@/lib/auth";
import { publishOrWarn } from "@/lib/publish";
import { assertSiteCategory } from "@/lib/sites";
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
import { artistFormSchema, formValuesToDbColumns } from "./schema";

type Supabase = Awaited<ReturnType<typeof createServerSupabaseClient>>;

/**
 * 방금 올린 이미지 중 행이 참조하지 않는 것만 지우는 보상 삭제.
 *
 * 고아 판정은 이 요청의 로드 시점 경로가 아니라 행의 "현재" 경로를 재조회해서 한다 —
 * 두 탭이 같은 파일을 올리면 콘텐츠 해시가 같아 경로가 겹치는데, 로드 시점 기준으로
 * 판정하면 진 쪽이 이긴 저장의 라이브 파일을 지우게 된다. 같은 이유로 create의 컬럼
 * update 실패에도 재조회가 필요하다: 응답만 유실되고 서버에서 커밋됐다면 행이 이미
 * 그 경로를 가리키므로, 무조건 지우면 고아가 아니라 깨진 참조(사이트에 404 이미지)가
 * 남는다. 재조회에 실패하면 아무것도 지우지 않는다 — 고아 잔존(removeImages 로그로
 * 추적 가능)이 라이브 파일 유실보다 낫다.
 */
async function removeUploadedOrphans(
  supabase: Supabase,
  id: string,
  uploadedPaths: (string | null | undefined)[],
): Promise<void> {
  const uploaded = uploadedPaths.filter((p): p is string => Boolean(p));
  if (uploaded.length === 0) return;
  const { data: current, error } = await supabase
    .from("artists")
    .select("image_path, logo_image_path")
    .eq("id", id)
    .maybeSingle();
  if (error) {
    console.error(
      `[admin] 고아 이미지 판정용 재조회 실패 — 정리 보류: ${uploaded.join(", ")}`,
      error.message,
    );
    return;
  }
  // 행이 사라진 경우(current null: 삭제가 레이스를 이김)엔 업로드 전부가 고아다.
  const live = new Set([current?.image_path, current?.logo_image_path]);
  await removeImages(
    supabase,
    uploaded.filter((p) => !live.has(p)),
  );
}

export async function createArtist(
  siteParam: SiteSlug,
  formData: FormData,
): Promise<EntityActionResult<"name">> {
  try {
    // 소속 사이트는 라우트 세그먼트에서 결정 — 서버측에서도 유효성 방어.
    const site = siteSlugSchema.parse(siteParam);
    // 라우트 가드와 같은 범위 검증 — 근거는 assertSiteCategory 주석.
    assertSiteCategory(site, "artists");
    // 인가는 RLS가 최종 판정하지만 여기서 먼저 끊는다 — 그래야 이미지 업로드·발행 같은
    // 부수효과가 시작되지 않고, 사용자도 DB 오류 원문 대신 제대로 된 문구를 본다.
    // (릴리즈·투어 액션도 같은 자리에서 같은 가드를 건다.)
    await assertSiteAccess(site);
    const values = artistFormSchema.parse(
      JSON.parse(String(formData.get("payload"))),
    );
    const columns = formValuesToDbColumns(values);

    const slug = slugify(values.name);
    if (!slug) {
      // slug는 이름에서만 파생되므로 고칠 곳은 항상 name 필드다.
      return {
        ok: false,
        error: "이름에서 slug를 만들 수 없습니다.",
        field: "name",
      };
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
      // 23505는 (site_slug, slug) 유니크 위반 = 이름 중복이라 name 필드에 귀속시킨다.
      // 그 밖의 DB 오류는 고칠 필드를 특정할 수 없어 토스트로 남긴다.
      if (error.code === "23505") {
        return {
          ok: false,
          error: `이 사이트에 slug "${slug}"가 이미 존재합니다(이름 중복).`,
          field: "name",
        };
      }
      return { ok: false, error: error.message };
    }
    const id = data.id;

    // 행 생성 이후 단계(이미지 업로드 → image 컬럼 update).
    // 여기서 실패해도 행은 이미 존재하므로 삭제하지 않고 편집 화면으로 안내(dead-end 회피).
    // 업로드 결과는 catch에서도 보여야 한다(컬럼 update 실패 시 업로드된 파일 보상 삭제).
    let profileUpload: { path: string; placeholder: string } | null = null;
    let logoUpload: { path: string; placeholder: string } | null = null;
    try {
      profileUpload = profile
        ? await uploadEntityImage(
            supabase,
            "artist",
            site,
            slug,
            "profile",
            profile,
          )
        : null;
      logoUpload = logo
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
      // 업로드까지 됐지만 컬럼 update가 실패한 파일은 어떤 행도 참조하지 않는 고아 —
      // 편집 화면 재저장 시 같은 콘텐츠면 같은 해시 경로로 다시 올라가므로 지워도 안전.
      // 단, 판정은 행의 현재 경로 재조회로 한다(응답만 유실된 커밋 보호, 헬퍼 주석 참고).
      await removeUploadedOrphans(supabase, id, [
        profileUpload?.path,
        logoUpload?.path,
      ]);
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
): Promise<EntityActionResult> {
  try {
    const site = siteSlugSchema.parse(siteParam);
    // 라우트 가드와 같은 범위 검증 — 근거는 assertSiteCategory 주석.
    assertSiteCategory(site, "artists");
    await assertSiteAccess(site);
    const values = artistFormSchema.parse(
      JSON.parse(String(formData.get("payload"))),
    );
    const columns = formValuesToDbColumns(values);

    const supabase = await createServerSupabaseClient();

    // slug·site_slug는 불변(§13) — 기존 행에서 slug를 읽어 이미지 경로 조립·교체 삭제에 사용.
    const { data: existing, error: loadError } = await supabase
      .from("artists")
      .select("slug, image_path, logo_image_path, updated_at")
      .eq("id", id)
      .eq("site_slug", site)
      .maybeSingle();
    if (loadError) return { ok: false, error: loadError.message };
    if (!existing) return { ok: false, error: "아티스트를 찾을 수 없습니다." };

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

    const profile = imageFile(formData, "profileImage");
    const logo = imageFile(formData, "logoImage");
    // 이미지 유효성은 업로드 전에 검사 — 불량 입력이 부수효과를 만들지 않게(create와 동일).
    if (profile) validateImageFile(profile);
    if (logo) validateImageFile(logo);

    // 업로드 결과는 catch에서도 보여야 한다 — profile만 성공하고 logo가 실패하면
    // (순단·rate-limit) 성공분이 어떤 행도 참조하지 않는 고아로 남으므로, create의
    // 실패 경로와 같은 헬퍼로 보상 삭제한 뒤 실패를 알린다.
    let profileUpload: { path: string; placeholder: string } | null = null;
    let logoUpload: { path: string; placeholder: string } | null = null;
    try {
      profileUpload = profile
        ? await uploadEntityImage(
            supabase,
            "artist",
            site,
            existing.slug,
            "profile",
            profile,
          )
        : null;
      logoUpload = logo
        ? await uploadEntityImage(
            supabase,
            "artist",
            site,
            existing.slug,
            "logo",
            logo,
          )
        : null;
    } catch (uploadError) {
      await removeUploadedOrphans(supabase, id, [
        profileUpload?.path,
        logoUpload?.path,
      ]);
      return { ok: false, error: toErrorMessage(uploadError) };
    }

    // 새 파일 없이 제거만 요청한 경우(폼의 "제거" 버튼) — 컬럼을 비운다.
    const removeProfile = !profile && imageRemoved(formData, "removeProfileImage");
    const removeLogo = !logo && imageRemoved(formData, "removeLogoImage");

    // 새 파일이 온 이미지 컬럼만 갱신, 없으면 기존값 유지. site_slug·slug는 컬럼에서 제외(불변).
    const imageColumns: Database["public"]["Tables"]["artists"]["Update"] = {};
    if (profileUpload) {
      imageColumns.image_path = profileUpload.path;
      imageColumns.image_placeholder = profileUpload.placeholder;
    } else if (removeProfile) {
      imageColumns.image_path = null;
      imageColumns.image_placeholder = null;
    }
    if (logoUpload) {
      imageColumns.logo_image_path = logoUpload.path;
    } else if (removeLogo) {
      imageColumns.logo_image_path = null;
    }

    // update가 적용되지 못했을 때 방금 올린 새 이미지는 보상 삭제 대상이다(판정 규칙은
    // removeUploadedOrphans 주석 참고 — create의 실패 경로와 같은 헬퍼를 쓴다).
    const uploadedPaths = [profileUpload?.path, logoUpload?.path];

    // updated_at 매치 조건이 2차(레이스) 검사다: 위 1차 검사 후 이 update 사이에 다른
    // 저장이 끼어들면 트리거가 updated_at을 바꿔 매치 0건이 된다 — select("id")로 실제
    // 갱신 행 수를 확인해 0건을 충돌로 처리한다. site_slug 스코프는 release/tour와 동일 패턴.
    const { data: updated, error } = await supabase
      .from("artists")
      .update({ ...columns, ...imageColumns })
      .eq("id", id)
      .eq("site_slug", site)
      .eq("updated_at", existing.updated_at)
      .select("id");
    if (error) {
      await removeUploadedOrphans(supabase, id, uploadedPaths);
      return { ok: false, error: error.message };
    }
    if (!updated || updated.length === 0) {
      await removeUploadedOrphans(supabase, id, uploadedPaths);
      return { ok: false, error: CONCURRENT_EDIT_MESSAGE };
    }

    // 교체·제거된 이전 이미지 삭제(best-effort, DB 갱신 뒤라 실패해도 컬럼은 이미 비어 있다).
    // 새 경로와 동일하면(동일 콘텐츠 해시) 방금 올린 파일을 지우게 되므로 제외한다.
    const oldProfilePath =
      (profileUpload && existing.image_path !== profileUpload.path) ||
      removeProfile
        ? existing.image_path
        : null;
    const oldLogoPath =
      (logoUpload && existing.logo_image_path !== logoUpload.path) || removeLogo
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
): Promise<EntityActionResult> {
  try {
    const site = siteSlugSchema.parse(siteParam);
    // 라우트 가드와 같은 범위 검증 — 근거는 assertSiteCategory 주석.
    assertSiteCategory(site, "artists");
    await assertSiteAccess(site);
    const supabase = await createServerSupabaseClient();

    // slug는 삭제된 상세 페이지 캐시 태그 조립에, 이미지 경로는 Storage 정리에 쓴다.
    const { data: existing, error: loadError } = await supabase
      .from("artists")
      .select("slug, image_path, logo_image_path")
      .eq("id", id)
      .eq("site_slug", site)
      .maybeSingle();
    // 조회 순단을 "행 없음"으로 오인하면 삭제만 성공하고 발행·Storage 정리가
    // 스킵돼 삭제된 콘텐츠가 사이트 캐시에 영구 잔존한다(TTL 없음) — 삭제 전 중단.
    if (loadError) return { ok: false, error: loadError.message };

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
        "delete",
      );
    }

    revalidatePath(`/${site}/artists`);
    return publishWarning ? { ok: true, warning: publishWarning } : { ok: true };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}
