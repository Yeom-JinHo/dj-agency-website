"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { SiteSlug } from "@repo/content/schema";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteArtist } from "./actions";

/** 아티스트 삭제 — confirm 다이얼로그 후 실행(§8). */
export function DeleteArtistButton({
  site,
  artistId,
  artistName,
}: {
  site: SiteSlug;
  artistId: string;
  artistName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onConfirm() {
    setDeleting(true);
    const result = await deleteArtist(site, artistId);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setOpen(false);
    toast.success("아티스트를 삭제했습니다.");
    router.push(`/${site}/artists`);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive">
          삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>아티스트 삭제</DialogTitle>
          <DialogDescription>
            &ldquo;{artistName}&rdquo;을(를) 삭제합니다. 이 작업은 되돌릴 수
            없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              취소
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={onConfirm}
          >
            {deleting ? "삭제 중…" : "삭제"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
