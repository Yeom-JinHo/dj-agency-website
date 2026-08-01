"use client";

import { useState } from "react";

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

/**
 * 확인 다이얼로그를 거치는 로그아웃 버튼. 서버 액션 리다이렉트는 클라이언트
 * 네비게이션이라 beforeunload 미저장 경고에 안 잡힌다 — 폼 편집 중 원클릭
 * 세션 종료를 이 확인 단계로 막는다.
 */
export function SignOutButton({ action }: { action: () => Promise<void> }) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="sm">
          로그아웃
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>로그아웃</DialogTitle>
          <DialogDescription>
            저장하지 않은 변경사항은 사라집니다. 로그아웃할까요?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              취소
            </Button>
          </DialogClose>
          <form action={action}>
            <Button type="submit">로그아웃</Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
