"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import type { EntityActionResult } from "@/lib/action-result";
import { withSearch } from "@/lib/list-search";
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

/** 삭제 실패 토스트는 수동 해제라 저절로 사라지지 않는다 — 같은 id로 덮어써서
 *  재시도할 때마다 영구 토스트가 쌓이는 걸 막고, 성공 시 이 id로 거둔다. */
const DELETE_ERROR_TOAST = "delete-entity-error";

/**
 * 엔티티 삭제 — confirm 다이얼로그 후 실행(§8, Artist/Release/Tour 공용).
 * onDelete는 상세 페이지(서버 컴포넌트)에서 site·id를 bind한 서버 액션을 받는다.
 */
export function DeleteEntityButton({
  entityLabel,
  entityName,
  listHref,
  onDelete,
}: {
  /** "아티스트"·"릴리즈"·"투어" — 다이얼로그 제목과 성공 토스트에 쓰인다. */
  entityLabel: string;
  entityName: string;
  listHref: string;
  onDelete: () => Promise<EntityActionResult>;
}) {
  const router = useRouter();
  // 목록에서 실어온 검색·정렬 쿼리를 삭제 후 복귀 경로에 되돌려준다(폼 제출과 동일 규약).
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onConfirm() {
    setDeleting(true);
    const result = await onDelete();

    if (!result.ok) {
      setDeleting(false);
      // 실패는 자동으로 사라지면 안 된다 — 되돌릴 수 없는 작업의 결과이고, 4초 안에
      // 우하단으로 시선을 옮기지 못한 사용자는 삭제됐는지조차 알 수 없게 된다.
      toast.error(result.error, {
        id: DELETE_ERROR_TOAST,
        duration: Infinity,
      });
      return;
    }
    // 재시도로 성공한 경우 앞선 실패 토스트를 거둔다 — 수동 해제라 그냥 두면
    // 성공 후에도 목록 화면에 실패 문구가 그대로 남는다.
    toast.dismiss(DELETE_ERROR_TOAST);
    // 삭제는 성공했으나 사이트 반영(발행)만 실패한 경우 경고로 알린다(§4.3).
    if (result.warning) {
      // 편집자가 직접 재발행해야 하는 사후 조치라 목록으로 이동한 뒤에도 남긴다.
      // Toaster가 루트 레이아웃에 있어 클라이언트 네비게이션을 넘어 살아남는다.
      toast.warning(result.warning, { duration: Infinity });
    } else {
      toast.success(`${entityLabel}를 삭제했습니다.`);
    }
    // 다이얼로그를 연 채 pending 유지 — 네비게이션 완료로 언마운트될 때까지
    // 삭제된 엔티티 화면이 재노출·재조작되는 걸 막는다.
    router.push(withSearch(listHref, searchParams));
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!deleting) setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        {/* 트리거는 outline으로 낮춘다 — 편집 화면 우상단의 red filled는 저장(하단
            sticky)보다 강한 최상위 CTA로 읽혔고, 목록의 "새 릴리즈"(filled)와 같은
            자리라 습관 클릭 위험도 있었다. 파괴 의사를 확정하는 다이얼로그 안의
            확인 버튼만 destructive filled를 유지한다. */}
        <Button
          type="button"
          variant="outline"
          className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
        >
          삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{entityLabel} 삭제</DialogTitle>
          <DialogDescription>
            &ldquo;{entityName}&rdquo;을(를) 삭제합니다. 이 작업은 되돌릴 수
            없습니다.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={deleting}>
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
