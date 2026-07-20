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
import { deleteTour } from "./actions";

/** 투어 삭제 — confirm 다이얼로그 후 실행(§8). */
export function DeleteTourButton({
  site,
  tourId,
  tourTitle,
}: {
  site: SiteSlug;
  tourId: string;
  tourTitle: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onConfirm() {
    setDeleting(true);
    const result = await deleteTour(site, tourId);
    setDeleting(false);

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setOpen(false);
    // 삭제는 성공했으나 사이트 반영(발행)만 실패한 경우 경고로 알린다(§4.3).
    if (result.warning) {
      toast.warning(result.warning);
    } else {
      toast.success("투어를 삭제했습니다.");
    }
    router.push(`/${site}/tours`);
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
          <DialogTitle>투어 삭제</DialogTitle>
          <DialogDescription>
            &ldquo;{tourTitle}&rdquo;을(를) 삭제합니다. 이 작업은 되돌릴 수
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
