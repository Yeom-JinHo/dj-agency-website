"use client";

import { useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import type { EntityActionResult } from "@/lib/action-result";
import { withSearch } from "@/lib/list-search";
import { UNSAVED_LEAVE_CONFIRM_MESSAGE } from "@/lib/unsaved-guard";
import { useUnsavedWarning } from "@/lib/use-unsaved-warning";

/**
 * 폼 제출 액션. 실패 시 실을 수 있는 field를 그 폼에 실제로 존재하는 이름으로
 * 좁히는 게 목적이라 별칭으로 둔다(create/update 두 곳에서 같은 형태).
 */
type EntitySubmitAction<TValues extends FieldValues> = (
  formData: FormData,
) => Promise<EntityActionResult<FieldPath<TValues>>>;

/**
 * Artist/Release/Tour 폼의 제출·이탈 처리(세 폼이 동일했던 부분만 모은다).
 * 엔티티별로 다른 건 FormData 조립·액션·문구뿐이라 그것만 파라미터로 받는다.
 * 필드 정의·파일 상태 등 폼 고유 부분은 각 폼이 계속 소유한다.
 */
export function useEntityFormSubmit<TValues extends FieldValues>({
  form,
  mode,
  listHref,
  createdMessage,
  hasUnsaved,
  buildFormData,
  create,
  update,
}: {
  /**
   * RHF 인스턴스. 서버 오류의 필드 귀속(setError+setFocus)을 여기서 처리하려면
   * 훅이 폼을 알아야 한다 — 콜백만 받으면 세 폼이 각자 같은 배선을 복제하게 되고
   * 한쪽만 고쳐지는 표류가 생긴다. 필드 이름 타입도 이 인스턴스에서 파생된다.
   */
  form: UseFormReturn<TValues>;
  mode: "create" | "edit";
  /** 목록 경로. 성공 후 이동 및 부분 성공 시 편집 경로(`${listHref}/${id}`) 조립에 쓴다. */
  listHref: string;
  /** create 성공 토스트 문구(edit는 세 폼 공통이라 고정). */
  createdMessage: string;
  /** RHF isDirty + 폼이 소유한 파일 상태를 합친 미저장 여부. */
  hasUnsaved: boolean;
  buildFormData: (values: TValues) => FormData;
  create: EntitySubmitAction<TValues>;
  update: EntitySubmitAction<TValues>;
}) {
  const router = useRouter();
  // 목록의 검색·정렬 쿼리를 상세까지 실어온 것을 복귀 경로에 그대로 되돌려준다 —
  // 이게 없으면 저장/취소 때마다 쿼리 없는 목록으로 가서 검색어가 날아간다.
  // listHref는 항상 쿼리 없는 base로 받는다(부분 성공의 `${listHref}/${id}` 조립이 깨지지 않게).
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  // 제출 버튼이 fieldset 밖으로 나가고 disabled 대신 aria-disabled를 쓰면서(포커스 보존,
  // FormSubmitButton 주석 참고) 브라우저가 막아주던 중복 제출을 여기서 막아야 한다.
  // setSubmitting은 다음 렌더에야 반영되므로 같은 틱의 연타는 state로 못 거른다 — ref여야 한다.
  const submittingRef = useRef(false);

  useUnsavedWarning(hasUnsaved && !submitting);

  /** 제출 잠금 해제. ref와 state를 함께 되돌린다 — 한쪽만 풀리면 재시도가 영영 막힌다. */
  function stopSubmitting() {
    submittingRef.current = false;
    setSubmitting(false);
  }

  /** 검증 실패 시 RHF가 첫 오류 필드에 포커스하지만, sticky 저장 바에서
   * "아무 일도 없는" 것처럼 보이지 않게 토스트로도 알린다. */
  function onInvalid() {
    toast.error("입력값을 확인해주세요.");
  }

  async function onSubmit(values: TValues) {
    if (submittingRef.current) return;
    submittingRef.current = true;
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
      stopSubmitting();
      // 실패 토스트는 수동 해제(sonner 기본 4초 미적용) — 토스트 컨테이너는 Tab으로
      // 도달할 수 없고, 화면을 확대해 쓰는 편집자는 우하단 토스트를 시야에 넣기 전에
      // 4초가 끝난다(WCAG 2.2.1). 성공 토스트는 놓쳐도 손해가 없어 기본값 그대로 둔다.
      toast.error("요청을 처리하지 못했습니다. 네트워크 상태를 확인해주세요.", {
        duration: Infinity,
      });
      return;
    }
    if (!result.ok) {
      stopSubmitting();
      // 필드를 특정할 수 있는 실패(slug 중복 등)는 사라지는 토스트 대신 그 필드에
      // 붙인다 — 포커스 이동이 브라우저 기본 동작으로 스크롤까지 데려가므로
      // 오류 필드가 화면 밖이어도 편집자가 바로 도달한다.
      // 필드를 특정할 수 없는 실패(DB·네트워크 등)는 기존대로 토스트.
      if (result.field) {
        form.setError(result.field, { type: "server", message: result.error });
        form.setFocus(result.field, { shouldSelect: true });
        return;
      }
      // 필드로 못 옮기는 오류라 이 토스트가 유일한 단서 — 위와 같은 이유로 수동 해제.
      toast.error(result.error, { duration: Infinity });
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
      stopSubmitting();
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
