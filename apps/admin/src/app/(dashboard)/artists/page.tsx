import Image from "next/image";
import Link from "next/link";
import { createServerSupabaseClient } from "@repo/content/supabase/server";
import type { SiteSlug } from "@repo/content/schema";

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

/** 사이트 노출 뱃지용 짧은 코드(표시 전용). */
const SITE_SHORT: Record<SiteSlug, string> = {
  "vague-frequency-labs": "VFL",
  "payday-records": "PDR",
  "celebrate-agency": "CEL",
  juntaro: "JUN",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-CA");
}

export default async function ArtistsPage() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("artists")
    .select(
      "id, slug, name, image_path, updated_at, artist_sites(site_slug)",
    )
    .order("updated_at", { ascending: false });

  const artists = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Artists</h1>
          <p className="text-muted-foreground text-sm">
            Shared roster across all sites.
          </p>
        </div>
        <Button asChild>
          <Link href="/artists/new">New artist</Link>
        </Button>
      </div>

      {error ? (
        <p className="text-destructive text-sm">
          아티스트를 불러오지 못했습니다: {error.message}
        </p>
      ) : artists.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          아직 아티스트가 없습니다. &ldquo;New artist&rdquo;로 추가하세요.
        </p>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14"></TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Sites</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artists.map((artist) => {
                const thumb = mediaUrl(artist.image_path);
                return (
                  <TableRow key={artist.id} className="relative">
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
                        href={`/artists/${artist.id}`}
                        className="after:absolute after:inset-0"
                      >
                        {artist.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {artist.slug}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {artist.artist_sites.map((s) => (
                          <span
                            key={s.site_slug}
                            className="border-border text-muted-foreground rounded border px-1.5 py-0.5 text-xs"
                          >
                            {SITE_SHORT[s.site_slug as SiteSlug] ?? s.site_slug}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(artist.updated_at)}
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
