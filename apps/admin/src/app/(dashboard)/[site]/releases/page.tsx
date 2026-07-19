import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  adminListReleases,
  adminListArtists,
} from "@repo/content/admin-queries";
import { siteSlugSchema } from "@repo/content/schema";

import { mediaUrl } from "@/lib/media";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// 인증 세션(쿠키)에 의존하므로 정적 프리렌더 제외.
export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-CA");
}

export default async function ReleasesPage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site } = await params;
  // artist 패턴과 동일: layout 가드에 더해 페이지에서도 site 재검증(방어 심층화).
  const parsedSite = siteSlugSchema.safeParse(site);
  if (!parsedSite.success) notFound();
  const siteSlug = parsedSite.data;

  const [releases, artists] = await Promise.all([
    adminListReleases(siteSlug),
    adminListArtists(siteSlug),
  ]);

  // primaryArtistId → 로스터 아티스트명(크레딧이 없을 때 표시용).
  const artistNameById = new Map(artists.map((a) => [a.id, a.name]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">릴리즈</h1>
          <p className="text-muted-foreground text-sm">
            이 사이트의 릴리즈.
          </p>
        </div>
        <Button asChild>
          <Link href={`/${site}/releases/new`}>새 릴리즈</Link>
        </Button>
      </div>

      {releases.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          아직 릴리즈가 없습니다. &ldquo;새 릴리즈&rdquo;로 추가하세요.
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14"></TableHead>
                <TableHead>제목</TableHead>
                <TableHead>아티스트</TableHead>
                <TableHead>발매일</TableHead>
                <TableHead>정렬</TableHead>
                <TableHead>수정일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {releases.map((release) => {
                const thumb = mediaUrl(release.artworkPath);
                // credit(로스터 밖 표기) 우선, 없으면 연결된 로스터 아티스트명.
                const artist =
                  release.artistCredit ??
                  (release.primaryArtistId
                    ? artistNameById.get(release.primaryArtistId)
                    : undefined);
                return (
                  <TableRow
                    key={release.id}
                    className="relative cursor-pointer"
                  >
                    <TableCell>
                      <div className="bg-muted flex size-9 items-center justify-center overflow-hidden rounded-md">
                        {thumb ? (
                          <Image
                            src={thumb}
                            alt=""
                            width={36}
                            height={36}
                            className="size-full object-cover"
                          />
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      <Link
                        href={`/${site}/releases/${release.id}`}
                        className="after:absolute after:inset-0"
                      >
                        {release.title}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {artist ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {release.releaseDate
                        ? formatDate(release.releaseDate)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {release.sortOrder}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(release.updatedAt)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
