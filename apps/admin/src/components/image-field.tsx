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
import { Label } from "@/components/ui/label";

/**
 * 미리보기 박스의 한 변(px). 세 폼 모두 기본 정보 카드의 13rem 그리드 트랙에
 * 이 컴포넌트를 세로로 세우므로 트랙 폭과 같은 값이어야 한다.
 *
 * 정사각 박스 + object-contain인 이유: 높이만 고정하고 폭을 원본 비율에 맡기면
 * (종전 h-52 w-auto) 3:2 가로 원본이 312px, 16:9가 320px로 렌더돼 트랙을 넘고,
 * 앵커의 overflow-hidden에 걸려 좌우가 잘린다 — 미리보기가 저장 전 마지막
 * 검증 게이트라는 전제(크롭 금지)가 무너진다. 박스에 담으면 세로 원본은
 * 139×208, 가로 원본은 208×139로 어느 쪽도 넘치지 않고 잘리지도 않는다.
 *
 * 빈 자리("이미지 없음")도 같은 정사각이다 — 크기가 다르면 이미지를 고르거나
 * 지울 때 아래 컨트롤이 위아래로 튄다.
 */
const PREVIEW_PX = 208;

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
 * 모듈 상수 하나가 아니라 인스턴스별로 붙이는 이유: 한 화면에 이미지 필드가 둘 이상
 * 놓이면 id를 공유하는 순간, 한쪽에 올바른 파일을 고를 때 아직 해소되지 않은 다른
 * 쪽의 거부 안내까지 함께 거둬간다. (근거로 들던 아티스트 폼의 프로필·로고 두 필드는
 * #319에서 로고를 감추며 사라졌다 — 지금 세 폼 모두 인스턴스가 하나씩이다. 규약은
 * 유지한다: 필드가 다시 늘어날 때 되살리는 것보다 값이 싸다.)
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
      {/* 세로 스택 — 세 폼 모두 기본 정보 카드의 13rem 트랙에 이 필드를 세운다.
          가로 배치(이미지 옆에 버튼)는 그 폭에서 파일명이 서너 글자에 잘린다. */}
      <div className="flex flex-col items-start gap-2">
        {preview ? (
          /* 미리보기는 저장 전 마지막 검증 게이트다. 정사각 cover 크롭은 세로
             원본(아티스트 2000×3000)의 33%를 숨겨 워터마크·보더 같은 "내렸어야
             할 사유"가 발행 후에야 보이는 경로를 만든다 — 원본 비율 그대로,
             크롭 없이 보여주고 클릭하면 원본을 새 탭으로 연다.
             박스 치수와 object-contain의 근거는 PREVIEW_PX 주석. */
          <a
            href={preview}
            target="_blank"
            rel="noreferrer"
            aria-label={`${label} 원본을 새 탭에서 열기`}
            /* disabled:opacity-50은 폼 컨트롤(input·button·select)에만 걸린다 —
               이 링크는 컨트롤이 아니라 제출 중 fieldset이 잠겨도 혼자 또렷하게
               남고 클릭도 그대로 먹었다. 잠긴 영역의 일부라는 걸 같은 어휘로
               말한다(조상 fieldset:disabled를 직접 겨냥). */
            className="bg-muted flex size-52 shrink-0 items-center justify-center overflow-hidden rounded-md border [fieldset:disabled_&]:pointer-events-none [fieldset:disabled_&]:opacity-50"
          >
            <Image
              src={preview}
              alt={label}
              width={PREVIEW_PX}
              height={PREVIEW_PX}
              unoptimized
              className="size-full object-contain"
            />
          </a>
        ) : (
          <div className="bg-muted flex size-52 shrink-0 items-center justify-center overflow-hidden rounded-md border [fieldset:disabled_&]:opacity-50">
            {/* muted 판 위에서는 text-muted-foreground(#737373)가 4.34:1로 AA 미달이다
               (흰 배경 위 4.73:1이 배경이 bg-muted #F5F5F5로 바뀌며 뒤집힌다).
               foreground 60%는 합성색 #686868 → 4.65:1로 통과하면서 본문 톤까지
               올라가지는 않아 플레이스홀더의 위계를 유지한다. */}
            <span className="text-foreground/60 text-xs">이미지 없음</span>
          </div>
        )}
        {/* 주축이 세로라 flex-1은 높이를 늘린다 — 폭만 채운다. */}
        <div className="w-full min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            {/* 네이티브 파일 인풋은 스타일을 입혀도 "선택된 파일 없음" 문자열과 긴
                빈 띠가 남아 폼 어휘에서 이질적이었다(designer 독립 리뷰). 인풋은
                sr-only로 숨기고(라벨 연결·폼 동작 유지) 앱 공통 버튼이 대신 연다.
                탭 스톱은 버튼 하나만 남긴다(인풋 tabIndex -1). */}
            <input
              id={inputId}
              ref={inputRef}
              type="file"
              accept={ALLOWED_IMAGE_MIME.join(",")}
              aria-describedby={hintId}
              onChange={(e) => onSelect(e.target.files?.[0] ?? null)}
              tabIndex={-1}
              className="sr-only"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
            >
              {preview ? "이미지 교체" : "이미지 선택"}
            </Button>
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
          {/* 방금 고른 파일명 — 저장 전이라 썸네일만으로는 "바뀐 상태"임이 안 보일
              수 있어 텍스트로도 남긴다. 버튼과 같은 행에 두면 208px 트랙에서 남는
              폭이 ~48px이라 서너 글자에 잘려 목적을 잃는다 — 아래 줄로 내린다. */}
          {value.file ? (
            <span className="text-muted-foreground block truncate text-sm">
              {value.file.name}
            </span>
          ) : null}
          <p id={hintId} className="text-muted-foreground text-xs">
            {ALLOWED_IMAGE_LABEL} · 최대 {MAX_UPLOAD_MB}MB
          </p>
        </div>
      </div>
    </div>
  );
}
