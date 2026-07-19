import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteSlugSchema } from "@repo/content/schema";
import { adminListArtists } from "@repo/content/admin-queries";

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

// 인증 세션(쿠키)·비캐시 admin 쿼리에 의존하므로 정적 프리렌더 제외.
export const dynamic = "force-dynamic";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-CA");
}

export default async function ArtistsPage({
  params,
}: {
  params: Promise<{ site: string }>;
}) {
  const { site: siteParam } = await params;
  const parsed = siteSlugSchema.safeParse(siteParam);
  if (!parsed.success) notFound();
  const site = parsed.data;

  const artists = await adminListArtists(site);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">아티스트</h1>
          <p className="text-muted-foreground text-sm">
            이 사이트에 소속된 아티스트 로스터.
          </p>
        </div>
        <Button asChild>
          <Link href={`/${site}/artists/new`}>새 아티스트</Link>
        </Button>
      </div>

      {artists.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          아직 아티스트가 없습니다. &ldquo;새 아티스트&rdquo;로 추가하세요.
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14"></TableHead>
                <TableHead>이름</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead className="w-24">정렬 순서</TableHead>
                <TableHead>수정일</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artists.map((artist) => {
                const thumb = mediaUrl(artist.imagePath);
                return (
                  <TableRow key={artist.id} className="relative cursor-pointer">
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
                        href={`/${site}/artists/${artist.id}`}
                        className="after:absolute after:inset-0"
                      >
                        {artist.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {artist.slug}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {artist.sortOrder}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(artist.updatedAt)}
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
