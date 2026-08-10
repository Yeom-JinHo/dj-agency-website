import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { siteSlugSchema } from "@repo/content/schema";
import {
  adminCountArtistReferences,
  adminGetArtistById,
} from "@repo/content/admin-queries";

import { mediaUrl } from "@/lib/media";
import { EntityBreadcrumb } from "@/components/entity-breadcrumb";
import { DeleteEntityButton } from "@/components/delete-entity-button";
import { isSiteSlug, SITE_LABELS } from "@/lib/sites";
import { ArtistForm } from "../artist-form";
import { type ArtistFormValues } from "../schema";
import { deleteArtist } from "../actions";

/**
 * 제목에 아티스트명을 넣지 않고 정적 문구를 쓴다 — generateMetadata는 페이지와 별개로
 * 실행되므로 이름을 쓰려면 adminGetArtistById를 한 번 더 불러야 하는데, 그 중복이
 * 사라진다는 보장이 없기 때문이다: 이 함수는 React `cache()`로 감싸여 있지 않고
 * (admin-queries는 §7.4에 따라 캐시 계층을 의도적으로 배제한다) 호출마다
 * createServerSupabaseClient로 클라이언트를 새로 만든다. supabase-js가 내부적으로
 * 전역 fetch를 쓰긴 하지만, Next의 요청 메모이제이션이 그 래핑된 호출까지 확실히
 * 잡아준다고 볼 근거가 이 저장소 안에는 없다. 확인되지 않은 dedupe에 기대어 상세
 * 진입마다 DB 왕복을 두 배로 만드느니 제목을 고정한다.
 *
 * 어나운서 관점의 손실은 크지 않다: 목록("아티스트 · …") → 상세("아티스트 편집 · …")는
 * 제목이 바뀌므로 발화한다. 아티스트 A 상세에서 B 상세로 곧장 가는 경우만 침묵하는데,
 * 이 앱의 동선은 항상 목록을 거친다. 나중에 admin-queries가 cache()로 감싸이면
 * 그때 이름을 넣는 편이 안전하다.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ site: string }>;
}): Promise<Metadata> {
  const { site } = await params;
  if (!isSiteSlug(site)) return { title: "ye0m2 admin" };
  return { title: `아티스트 편집 · ${SITE_LABELS[site]} | ye0m2 admin` };
}

export default async function EditArtistPage({
  params,
}: {
  params: Promise<{ site: string; id: string }>;
}) {
  const { site: siteParam, id } = await params;
  const parsed = siteSlugSchema.safeParse(siteParam);
  if (!parsed.success) notFound();
  const site = parsed.data;

  // id도 site처럼 선검증 — 비-uuid 손입력 URL이 Postgres 22P02로 500이 되지 않게 404 처리.
  if (!z.string().uuid().safeParse(id).success) notFound();

  // 참조 카운트는 삭제 다이얼로그의 파급 효과 안내용 — FK가 set null이라 아티스트를
  // 지우면 참조하는 릴리즈·투어의 아티스트 연결이 경고 없이 끊기던 것을 표면화한다.
  const [artist, references] = await Promise.all([
    adminGetArtistById(id),
    adminCountArtistReferences(id),
  ]);
  // 다른 사이트의 아티스트를 이 라우트로 편집하지 못하게 소속 방어.
  if (!artist || artist.siteSlug !== site) notFound();

  const referencedParts = [
    references.releases > 0 ? `릴리즈 ${references.releases}개` : null,
    references.tours > 0 ? `투어 ${references.tours}개` : null,
  ].filter(Boolean);
  const referenceNote =
    referencedParts.length > 0
      ? `이 아티스트를 참조하는 ${referencedParts.join("·")}의 아티스트 연결이 함께 해제됩니다(해당 항목 자체는 삭제되지 않습니다).`
      : null;

  // adminGetArtistById가 Artist로 파싱해 socials/selectedWorks는 이미 검증된 배열 —
  // 페이지 단위 재파싱 불필요(§7.4 쿼리 경계가 파싱 소유).
  const defaultValues: ArtistFormValues = {
    name: artist.name,
    nickname: artist.nickname ?? "",
    shortDescriptionEn: artist.shortDescriptionEn ?? "",
    shortDescriptionKo: artist.shortDescriptionKo ?? "",
    fullDescriptionEn: artist.fullDescriptionEn ?? "",
    fullDescriptionKo: artist.fullDescriptionKo ?? "",
    city: artist.city ?? "",
    socials: artist.socials,
    selectedWorks: artist.selectedWorks,
    sortOrder: artist.sortOrder,
  };

  return (
    <div className="space-y-6">
      <EntityBreadcrumb site={site} category="artists" current={artist.name} />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          {/* 브레드크럼이 위치를 말하므로 h1은 최상위보다 한 단 작다(목록·new와 같은 규칙). */}
          <h1 className="text-xl font-semibold tracking-tight">
            {artist.name}
          </h1>
          <p className="text-muted-foreground text-sm">
            아티스트를 편집합니다. 저장하면 즉시 사이트에 반영됩니다.
          </p>
        </div>
        {/* site·id를 bind한 서버 액션을 넘긴다(공용 버튼은 엔티티를 모른다). */}
        <DeleteEntityButton
          entityLabel="아티스트"
          entityName={artist.name}
          listHref={`/${site}/artists`}
          referenceNote={referenceNote}
          onDelete={deleteArtist.bind(null, site, artist.id)}
        />
      </div>
      <ArtistForm
        mode="edit"
        site={site}
        artistId={artist.id}
        slug={artist.slug}
        updatedAt={artist.updatedAt}
        defaultValues={defaultValues}
        initialProfileUrl={mediaUrl(artist.imagePath)}
        initialLogoUrl={mediaUrl(artist.logoImagePath)}
      />
    </div>
  );
}
