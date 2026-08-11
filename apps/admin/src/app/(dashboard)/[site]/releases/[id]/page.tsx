import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";
import { adminGetReleaseById } from "@repo/content/admin-queries";
import { PLATFORM_LINK_KEYS, siteSlugSchema } from "@repo/content/schema";

import { mediaUrl } from "@/lib/media";
import { EntityBreadcrumb } from "@/components/entity-breadcrumb";
import { DeleteEntityButton } from "@/components/delete-entity-button";
import { rosterOptions } from "@/lib/roster-options";
import { isSiteSlug, SITE_LABELS } from "@/lib/sites";
import { ReleaseForm } from "../release-form";
import { type ReleaseFormValues } from "../schema";
import { deleteRelease } from "../actions";

// 릴리즈명 대신 정적 문구를 쓰는 이유는 artists/[id]/page.tsx 주석 참고
// (generateMetadata에서 adminGetReleaseById를 다시 부르면 dedupe 보장 없이 DB 왕복이 두 배).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ site: string }>;
}): Promise<Metadata> {
  const { site } = await params;
  if (!isSiteSlug(site)) return { title: "ye0m2 admin" };
  return { title: `릴리즈 편집 · ${SITE_LABELS[site]} | ye0m2 admin` };
}

export default async function EditReleasePage({
  params,
}: {
  params: Promise<{ site: string; id: string }>;
}) {
  const { site, id } = await params;
  // artist 패턴과 동일한 3중 방어: site 검증 + uuid 선검증(비-uuid 손입력 → 404) + 소속 대조.
  const parsedSite = siteSlugSchema.safeParse(site);
  if (!parsedSite.success) notFound();
  const siteSlug = parsedSite.data;
  if (!z.string().uuid().safeParse(id).success) notFound();

  const [release, artists] = await Promise.all([
    adminGetReleaseById(id),
    // 아티스트 미노출 사이트에선 빈 배열(rosterOptions 주석).
    rosterOptions(siteSlug),
  ]);

  // 다른 사이트의 릴리즈를 이 라우트로 편집하지 못하게 소속 방어.
  if (!release || release.siteSlug !== siteSlug) notFound();

  // platform_links → 5개 확정 키의 문자열 폼 표현(빈 키는 ""). Release는 이미 파싱된 도메인 객체.
  const platformLinks = Object.fromEntries(
    PLATFORM_LINK_KEYS.map((k) => [k, release.platformLinks[k] ?? ""])
  ) as Record<(typeof PLATFORM_LINK_KEYS)[number], string>;

  const defaultValues: ReleaseFormValues = {
    title: release.title,
    primaryArtistId: release.primaryArtistId ?? "",
    artistCredit: release.artistCredit ?? "",
    featuredArtists: release.featuredArtists.join(", "),
    label: release.label ?? "",
    catalogNo: release.catalogNo ?? "",
    releaseDate: release.releaseDate ?? "",
    shortDescriptionEn: release.shortDescriptionEn ?? "",
    shortDescriptionKo: release.shortDescriptionKo ?? "",
    fullDescriptionEn: release.fullDescriptionEn ?? "",
    fullDescriptionKo: release.fullDescriptionKo ?? "",
    platformLinks,
    socials: release.socials,
    sortOrder: release.sortOrder,
  };

  return (
    // max-w-4xl: 사이드바(16rem)+콘텐츠 패딩과 합쳐 1200px — 1366 노트북까지 들어가고
    // 사이드바 도입 전 값(2xl)이 남기던 우측 여백을 회수한다. 긴 텍스트의 measure는
    // 폼의 설명 카드 2열 그리드가 잡는다(한 열 ≈55자). 스켈레톤도 같은 폭이어야 한다.
    // 폼이 아니라 여기 있어야 헤더(브레드크럼·제목·삭제)와 폼의 우측 기준선이 맞는다.
    <div className="max-w-4xl min-w-0 space-y-6">
      <EntityBreadcrumb
        site={siteSlug}
        category="releases"
        current={release.title}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          {/* 브레드크럼이 위치를 말하므로 h1은 최상위보다 한 단 작다(목록·new와 같은 규칙). */}
          <h1 className="text-xl font-semibold tracking-tight">
            {release.title}
          </h1>
          <p className="text-muted-foreground text-sm">
            릴리즈를 편집합니다. 저장하면 즉시 반영됩니다.
          </p>
        </div>
        {/* site·id를 bind한 서버 액션을 넘긴다(공용 버튼은 엔티티를 모른다). */}
        <DeleteEntityButton
          entityLabel="릴리즈"
          entityName={release.title}
          listHref={`/${siteSlug}/releases`}
          onDelete={deleteRelease.bind(null, siteSlug, release.id)}
        />
      </div>
      <ReleaseForm
        mode="edit"
        site={siteSlug}
        releaseId={release.id}
        slug={release.slug}
        updatedAt={release.updatedAt}
        defaultValues={defaultValues}
        artists={artists}
        initialArtworkUrl={mediaUrl(release.artworkPath)}
      />
    </div>
  );
}
