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
  referenceNote = null,
  onDelete,
}: {
  /** "아티스트"·"릴리즈"·"투어" — 다이얼로그 제목과 성공 토스트에 쓰인다. */
  entityLabel: string;
  entityName: string;
  listHref: string;
  /**
   * 삭제의 파급 효과 안내(예: 이 아티스트를 참조하는 릴리즈·투어 건수).
   * 호출 측이 문구까지 조립해 넘긴다 — 공용 버튼은 엔티티 관계를 모른다.
   */
  referenceNote?: string | null;
  onDelete: () => Promise<EntityActionResult>;
}) {
  const router = useRouter();
  // 목록에서 실어온 검색·정렬 쿼리를 삭제 후 복귀 경로에 되돌려준다(폼 제출과 동일 규약).
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onConfirm() {
    setDeleting(true);
    // 액션 호출 자체의 실패(오프라인·게이트웨이 오류)는 reject로 온다 — 잡지 않으면
    // deleting이 true로 남아 닫기까지 막힌 다이얼로그가 무피드백으로 굳는다
    // (use-entity-form-submit의 reject 처리와 같은 규약).
    const result = await onDelete().catch((error: unknown) => {
      console.error("[admin] delete failed:", error);
      return null;
    });

    if (!result || !result.ok) {
      setDeleting(false);
      // 실패는 자동으로 사라지면 안 된다 — 되돌릴 수 없는 작업의 결과이고, 4초 안에
      // 우하단으로 시선을 옮기지 못한 사용자는 삭제됐는지조차 알 수 없게 된다.
      toast.error(
        result
          ? result.error
          : "요청을 처리하지 못했습니다. 네트워크 상태를 확인해주세요.",
        {
          id: DELETE_ERROR_TOAST,
          duration: Infinity,
        },
      );
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
        {/* 트리거는 ghost까지 낮춘다 — outline(빨간 테두리)로도 우상단에서 화면의
            가장 강한 유채색이라 시선을 저장보다 먼저 잡았다(designer 독립 리뷰).
            평시엔 muted로 가라앉고 hover에서만 destructive 의도를 드러낸다.
            파괴 의사를 확정하는 다이얼로그 안의 확인 버튼만 filled를 유지한다. */}
        <Button
          type="button"
          variant="ghost"
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          삭제
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{entityLabel} 삭제</DialogTitle>
          {/* "을(를)" 병기는 다른 카피의 완성도에 비해 거칠다 — 이름 뒤에 받침
              중립인 entityLabel(아티스트·릴리즈·투어, 모두 "를")을 붙여 조사를
              엔티티명에서 떼어낸다. 성공 토스트("{entityLabel}를 삭제했습니다")와
              같은 문형. */}
          <DialogDescription>
            &ldquo;{entityName}&rdquo; {entityLabel}를 삭제합니다. 이 작업은
            되돌릴 수 없습니다.
            {/* DialogDescription(단일 <p>) 안에 block span으로 둔다 — 별도 <p>로 빼면
                aria-describedby 밖이라 스크린리더가 확인 시점에 파급 효과를 못 듣는다. */}
            {referenceNote && (
              <span className="text-destructive mt-2 block">
                {referenceNote}
              </span>
            )}
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
