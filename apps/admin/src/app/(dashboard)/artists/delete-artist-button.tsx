"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  artistId,
  artistName,
}: {
  artistId: string;
  artistName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onConfirm() {
    setDeleting(true);
    const result = await deleteArtist(artistId);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setOpen(false);
    toast.success("아티스트를 삭제했습니다.");
    router.push("/artists");
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="destructive">
          Delete
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete artist</DialogTitle>
          <DialogDescription>
            &ldquo;{artistName}&rdquo;을(를) 삭제합니다. 이 작업은 되돌릴 수
            없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            variant="destructive"
            disabled={deleting}
            onClick={onConfirm}
          >
            {deleting ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
