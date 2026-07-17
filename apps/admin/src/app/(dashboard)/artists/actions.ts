"use server";

import { createHash } from "node:crypto";
import { revalidatePath } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createServerSupabaseClient } from "@repo/content/supabase/server";
import { toWebp } from "@repo/content/image";
import type { Database } from "@repo/content/supabase/types";
import type { SiteSlug } from "@repo/content/schema";

import { slugify } from "@/lib/media";
import { artistFormSchema, formValuesToDbInput } from "./schema";

type Supabase = SupabaseClient<Database>;

export type ArtistActionResult =
  | { ok: true; id?: string }
  | { ok: false; error: string };

const MEDIA_BUCKET = "media";

/**
 * 파일 → toWebp → Storage 업로드. 경로에 콘텐츠 해시를 넣어 캐시버스팅(§13 🔴):
 * `artist/{slug}/{kind}-{hash8}.webp`. 재업로드마다 새 경로라 CDN/next-image 캐시 충돌 없음.
 */
async function uploadArtistImage(
  supabase: Supabase,
  slug: string,
  kind: "profile" | "logo",
  file: File,
): Promise<{ path: string; placeholder: string }> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const { webp, placeholder } = await toWebp(bytes);
  const hash = createHash("sha256").update(webp).digest("hex").slice(0, 8);
  const path = `artist/${slug}/${kind}-${hash}.webp`;
  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, webp, { contentType: "image/webp", upsert: true });
  if (error) {
    throw new Error(`이미지 업로드 실패(${kind}): ${error.message}`);
  }
  return { path, placeholder };
}

/** FormData에서 유효한 이미지 파일만 추출(빈 input은 size 0). */
function imageFile(formData: FormData, key: string): File | null {
  const value = formData.get(key);
  return value instanceof File && value.size > 0 ? value : null;
}

/** 저장할 sites 배열 → artist_sites Insert 행. */
function siteRows(
  artistId: string,
  sites: { siteSlug: SiteSlug; sortOrder: number }[],
) {
  return sites.map((s) => ({
    artist_id: artistId,
    site_slug: s.siteSlug,
    sort_order: s.sortOrder,
  }));
}

/**
 * artist_sites를 폼 상태에 맞춘다: 체크된 사이트는 upsert(sort_order 갱신),
 * 빠진 사이트는 delete. 전량 teardown 대신 diff로 최소 변경.
 */
async function syncArtistSites(
  supabase: Supabase,
  artistId: string,
  sites: { siteSlug: SiteSlug; sortOrder: number }[],
): Promise<void> {
  if (sites.length > 0) {
    const { error } = await supabase
      .from("artist_sites")
      .upsert(siteRows(artistId, sites), { onConflict: "artist_id,site_slug" });
    if (error) throw new Error(`사이트 노출 갱신 실패: ${error.message}`);
  }
  const keep = sites.map((s) => s.siteSlug);
  let del = supabase.from("artist_sites").delete().eq("artist_id", artistId);
  if (keep.length > 0) {
    del = del.not("site_slug", "in", `(${keep.join(",")})`);
  }
  const { error } = await del;
  if (error) throw new Error(`사이트 노출 정리 실패: ${error.message}`);
}

/** best-effort Storage 삭제(고아 정리는 §12 향후 — 실패는 무시). */
async function removeImages(supabase: Supabase, paths: string[]): Promise<void> {
  const targets = paths.filter((p): p is string => Boolean(p));
  if (targets.length === 0) return;
  await supabase.storage
    .from(MEDIA_BUCKET)
    .remove(targets)
    .catch(() => undefined);
}

function toErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : String(err);
}

export async function createArtist(
  formData: FormData,
): Promise<ArtistActionResult> {
  try {
    const raw = formData.get("payload");
    const values = artistFormSchema.parse(JSON.parse(String(raw)));
    const { columns, sites } = formValuesToDbInput(values);

    const slug = slugify(values.name);
    if (!slug) {
      return { ok: false, error: "이름에서 slug를 만들 수 없습니다." };
    }

    // createServerSupabaseClient는 인증 세션을 실어 RLS(authenticated)가 서버측 방어로 동작.
    const supabase = await createServerSupabaseClient();

    const profile = imageFile(formData, "profileImage");
    const logo = imageFile(formData, "logoImage");
    const profileUpload = profile
      ? await uploadArtistImage(supabase, slug, "profile", profile)
      : null;
    const logoUpload = logo
      ? await uploadArtistImage(supabase, slug, "logo", logo)
      : null;

    const { data, error } = await supabase
      .from("artists")
      .insert({
        slug,
        ...columns,
        image_path: profileUpload?.path ?? null,
        logo_image_path: logoUpload?.path ?? null,
        image_placeholder: profileUpload?.placeholder ?? null,
      })
      .select("id")
      .single();

    if (error) {
      const message =
        error.code === "23505"
          ? `slug "${slug}"가 이미 존재합니다(이름 중복).`
          : error.message;
      return { ok: false, error: message };
    }

    await syncArtistSites(supabase, data.id, sites);

    // P3: publish(tags, sites) 연결 지점
    revalidatePath("/artists");
    return { ok: true, id: data.id };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}

export async function updateArtist(
  id: string,
  formData: FormData,
): Promise<ArtistActionResult> {
  try {
    const raw = formData.get("payload");
    const values = artistFormSchema.parse(JSON.parse(String(raw)));
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
      ? await uploadArtistImage(supabase, existing.slug, "profile", profile)
      : null;
    const logoUpload = logo
      ? await uploadArtistImage(supabase, existing.slug, "logo", logo)
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

    await syncArtistSites(supabase, id, sites);

    // 교체된 이전 이미지 삭제(best-effort).
    await removeImages(supabase, [
      profileUpload ? existing.image_path ?? "" : "",
      logoUpload ? existing.logo_image_path ?? "" : "",
    ]);

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
        existing.image_path ?? "",
        existing.logo_image_path ?? "",
      ]);
    }

    // P3: publish(tags, sites) 연결 지점
    revalidatePath("/artists");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: toErrorMessage(err) };
  }
}
