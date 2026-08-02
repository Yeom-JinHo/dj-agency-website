"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

import {
  ALLOWED_IMAGE_LABEL,
  ALLOWED_IMAGE_MIME,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_MB,
} from "@/lib/image-constraints";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

/**
 * 이미지 입력 상태. file은 새로 올릴 파일, removed는 "기존 이미지를 지운다"는
 * 의사(새 파일 없이 저장하면 컬럼이 비워진다). 둘 다 폼이 소유해 미저장 판정에 쓴다.
 */
export interface ImageFieldValue {
  file: File | null;
  removed: boolean;
}

export const EMPTY_IMAGE_FIELD: ImageFieldValue = { file: null, removed: false };

/**
 * 거부 토스트 id의 접두사. duration: Infinity라 스스로 사라지지 않으니 id로 덮어쓰고
 * 올바른 파일이 선택되면 거둔다 — 안 그러면 잘못된 파일을 고를 때마다 쌓이고,
 * Toaster가 루트 레이아웃에 있어 저장 후 이동한 화면까지 따라온다.
 *
 * 모듈 상수 하나가 아니라 인스턴스별로 붙이는 이유: 아티스트 폼처럼 이미지 필드가
 * 둘(프로필·로고)인 화면에서 id를 공유하면, 로고에 올바른 파일을 고를 때 아직
 * 해소되지 않은 프로필의 거부 안내까지 함께 거둬간다.
 */
const REJECT_TOAST_PREFIX = "image-field-reject";

/** 선택/제거된 상태가 하나라도 있으면 미저장(§4.4 파일은 RHF 밖 상태). */
export function isImageFieldDirty(value: ImageFieldValue): boolean {
  return value.file !== null || value.removed;
}

/**
 * 파일 선택 + 미리보기 + 제거(Artist/Release/Tour 공용, §4.4).
 * 서버와 같은 제한(image-constraints)으로 선택 즉시 검증해, 업로드 왕복 뒤에야
 * 형식·용량 오류를 알게 되는 걸 막는다.
 */
export function ImageField({
  label,
  initialUrl,
  value,
  onChange,
}: {
  label: string;
  initialUrl: string | null;
  value: ImageFieldValue;
  onChange: (value: ImageFieldValue) => void;
}) {
  const inputId = useId();
  // 형식·용량 제한은 없으면 올바르게 고를 수 없는 규칙이라 input에 aria-describedby로
  // 묶는다. RHF 필드가 아니라 FormDescription을 쓸 수 없어 id를 직접 만든다.
  const hintId = useId();
  const rejectToastId = `${REJECT_TOAST_PREFIX}-${inputId}`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const file = value.file;

  useEffect(() => {
    if (!file) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // 새로 고른 파일 > 제거 의사 > 기존 이미지 순으로 보여준다. objectUrl은 effect에서
  // 만들어지므로 그 전 1프레임은 기존 이미지를 유지한다(빈 칸 깜빡임 방지).
  const preview = file ? (objectUrl ?? initialUrl) : value.removed ? null : initialUrl;

  function onSelect(next: File | null) {
    if (!next) {
      // 파일 대화상자를 취소한 경우 — 제거 의사는 그대로 둔다.
      onChange({ file: null, removed: value.removed });
      return;
    }
    // 거부 토스트는 수동 해제(sonner 기본 4초 미적용) — 허용 형식·초과 용량 같은 값은
    // 다시 정확히 읽어야 고칠 수 있는데, 토스트는 Tab으로 도달할 수 없어 화면을 확대해
    // 쓰는 편집자는 시야에 넣기 전에 사라진다(WCAG 2.2.1).
    if (!(ALLOWED_IMAGE_MIME as readonly string[]).includes(next.type)) {
      toast.error(
        `지원하지 않는 형식입니다(${next.type || "unknown"}). ${ALLOWED_IMAGE_LABEL}만 올릴 수 있습니다.`,
        { id: rejectToastId, duration: Infinity },
      );
      resetInput();
      return;
    }
    if (next.size > MAX_UPLOAD_BYTES) {
      toast.error(
        `이미지가 너무 큽니다(${(next.size / 1024 / 1024).toFixed(1)}MB). ${MAX_UPLOAD_MB}MB 이하만 올릴 수 있습니다.`,
        { id: rejectToastId, duration: Infinity },
      );
      resetInput();
      return;
    }
    // 검증을 통과한 파일이 들어왔으니 앞선 거부 안내는 해소됐다.
    toast.dismiss(rejectToastId);
    onChange({ file: next, removed: false });
  }

  /** 같은 파일을 다시 골라도 change가 발생하도록 input 값을 비운다. */
  function resetInput() {
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <div className="flex items-center gap-4">
        <div className="bg-muted flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-md border">
          {preview ? (
            <Image
              src={preview}
              alt={label}
              width={80}
              height={80}
              unoptimized
              className="size-full object-cover"
            />
          ) : (
            /* muted 판 위에서는 text-muted-foreground(#737373)가 4.34:1로 AA 미달이다
               (흰 배경 위 4.73:1이 배경이 bg-muted #F5F5F5로 바뀌며 뒤집힌다).
               foreground 60%는 합성색 #686868 → 4.65:1로 통과하면서 본문 톤까지
               올라가지는 않아 플레이스홀더의 위계를 유지한다. */
            <span className="text-foreground/60 text-xs">이미지 없음</span>
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <Input
              id={inputId}
              ref={inputRef}
              type="file"
              accept={ALLOWED_IMAGE_MIME.join(",")}
              aria-describedby={hintId}
              onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
            />
            {value.removed ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onChange({ file: null, removed: false })}
              >
                되돌리기
              </Button>
            ) : preview ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // 원래 이미지가 없었다면 지울 대상도 없다 — 제거 의사를 남기지
                  // 않아야 미저장 경고·FormData 플래그가 헛돌지 않는다.
                  onChange({ file: null, removed: initialUrl !== null });
                  resetInput();
                }}
              >
                제거
              </Button>
            ) : null}
          </div>
          <p id={hintId} className="text-muted-foreground text-xs">
            {ALLOWED_IMAGE_LABEL} · 최대 {MAX_UPLOAD_MB}MB
          </p>
        </div>
      </div>
    </div>
  );
}
