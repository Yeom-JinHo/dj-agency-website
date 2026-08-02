"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

import type { EntityActionResult } from "@/lib/action-result";
import { withSearch } from "@/lib/list-search";
import { UNSAVED_LEAVE_CONFIRM_MESSAGE } from "@/lib/unsaved-guard";
import { useUnsavedWarning } from "@/lib/use-unsaved-warning";

/**
 * Artist/Release/Tour 폼의 제출·이탈 처리(세 폼이 동일했던 부분만 모은다).
 * 엔티티별로 다른 건 FormData 조립·액션·문구뿐이라 그 셋만 파라미터로 받는다.
 * 필드 정의·파일 상태 등 폼 고유 부분은 각 폼이 계속 소유한다.
 */
export function useEntityFormSubmit<TValues>({
  mode,
  listHref,
  createdMessage,
  hasUnsaved,
  buildFormData,
  create,
  update,
}: {
  mode: "create" | "edit";
  /** 목록 경로. 성공 후 이동 및 부분 성공 시 편집 경로(`${listHref}/${id}`) 조립에 쓴다. */
  listHref: string;
  /** create 성공 토스트 문구(edit는 세 폼 공통이라 고정). */
  createdMessage: string;
  /** RHF isDirty + 폼이 소유한 파일 상태를 합친 미저장 여부. */
  hasUnsaved: boolean;
  buildFormData: (values: TValues) => FormData;
  create: (formData: FormData) => Promise<EntityActionResult>;
  update: (formData: FormData) => Promise<EntityActionResult>;
}) {
  const router = useRouter();
  // 목록의 검색·정렬 쿼리를 상세까지 실어온 것을 복귀 경로에 그대로 되돌려준다 —
  // 이게 없으면 저장/취소 때마다 쿼리 없는 목록으로 가서 검색어가 날아간다.
  // listHref는 항상 쿼리 없는 base로 받는다(부분 성공의 `${listHref}/${id}` 조립이 깨지지 않게).
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  useUnsavedWarning(hasUnsaved && !submitting);

  /** 검증 실패 시 RHF가 첫 오류 필드에 포커스하지만, sticky 저장 바에서
   * "아무 일도 없는" 것처럼 보이지 않게 토스트로도 알린다. */
  function onInvalid() {
    toast.error("입력값을 확인해주세요.");
  }

  async function onSubmit(values: TValues) {
    setSubmitting(true);
    const fd = buildFormData(values);

    const result = await (mode === "create" ? create(fd) : update(fd)).catch(
      (error: unknown) => {
        // 액션 호출 자체의 실패(오프라인·게이트웨이 오류)는 reject로 온다.
        console.error("[admin] save failed:", error);
        return null;
      },
    );

    if (!result) {
      setSubmitting(false);
      toast.error("요청을 처리하지 못했습니다. 네트워크 상태를 확인해주세요.");
      return;
    }
    if (!result.ok) {
      setSubmitting(false);
      toast.error(result.error);
      return;
    }
    // 성공 시 pending 유지는 라우트가 실제로 바뀌는 경로에만 — 그래야
    // 네비게이션 완료 전 버튼 라벨 복귀(재클릭 유발)를 막으면서도 잠금이 안 남는다.
    // 부분 성공(생성됐지만 이미지 저장 실패): 편집 화면으로 안내해 이어서 저장.
    if (result.warning && result.id) {
      toast.warning(result.warning);
      if (mode === "create") {
        // 쿼리는 경로 뒤에 붙인다 — base와 id 사이에 끼면 URL이 깨진다.
        router.push(withSearch(`${listHref}/${result.id}`, searchParams));
        router.refresh();
        return;
      }
      // edit 모드는 같은 URL이라 언마운트가 없다 — 잠금을 풀어야 재시도 가능.
      setSubmitting(false);
      router.refresh();
      return;
    }
    toast.success(mode === "create" ? createdMessage : "변경사항을 저장했습니다.");
    router.push(withSearch(listHref, searchParams));
    router.refresh();
  }

  /** 취소 — 미저장 변경이 있으면 확인 후 목록으로. */
  function onCancel() {
    if (hasUnsaved && !window.confirm(UNSAVED_LEAVE_CONFIRM_MESSAGE)) {
      return;
    }
    router.push(withSearch(listHref, searchParams));
  }

  return { submitting, onSubmit, onInvalid, onCancel };
}
